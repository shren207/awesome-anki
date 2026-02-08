/**
 * Split API Routes
 */

import {
  applySplitResult,
  cloneSchedulingAfterSplit,
  extractTags,
  extractTextField,
  findCardsByNote,
  getNoteById,
  NotFoundError,
  performHardSplit,
  preBackup,
  requestCardSplit,
  rollback,
  type SplitResult,
  updateBackupWithCreatedNotes,
} from "@anki-splitter/core";
import { Hono } from "hono";

const app = new Hono();

/**
 * POST /api/split/preview
 * 분할 미리보기
 */
app.post("/preview", async (c) => {
  const { noteId, useGemini = false } = await c.req.json<{
    noteId: number;
    useGemini?: boolean;
  }>();

  const note = await getNoteById(noteId);
  if (!note) {
    throw new NotFoundError(`노트 ${noteId}를 찾을 수 없습니다`);
  }

  const text = extractTextField(note);
  const tags = extractTags(note);

  // Hard Split 먼저 시도
  const hardResult = performHardSplit(text, noteId);
  if (hardResult && hardResult.length > 1) {
    return c.json({
      noteId,
      splitType: "hard",
      originalText: text,
      splitCards: hardResult.map((card) => ({
        title: card.title,
        content: card.content,
        isMainCard: card.isMainCard,
      })),
      mainCardIndex: hardResult.findIndex((c) => c.isMainCard),
    });
  }

  // Soft Split (Gemini) 요청 시
  if (useGemini) {
    const geminiResult = await requestCardSplit({ noteId, text, tags });

    if (geminiResult.shouldSplit && geminiResult.splitCards.length > 1) {
      return c.json({
        noteId,
        splitType: "soft",
        originalText: text,
        splitCards: geminiResult.splitCards.map((card, idx) => ({
          title: card.title,
          content: card.content,
          isMainCard: idx === geminiResult.mainCardIndex,
        })),
        mainCardIndex: geminiResult.mainCardIndex,
        splitReason: geminiResult.splitReason,
      });
    }

    return c.json({
      noteId,
      splitType: "none",
      reason:
        geminiResult.splitReason || "Gemini determined split is not needed",
    });
  }

  return c.json({
    noteId,
    splitType: "none",
    reason: "Hard split not applicable. Enable useGemini for soft split.",
  });
});

/**
 * POST /api/split/apply
 * 분할 적용 (자동 롤백 포함)
 */
app.post("/apply", async (c) => {
  const { noteId, deckName, splitCards, mainCardIndex } = await c.req.json<{
    noteId: number;
    deckName: string;
    splitCards: Array<{
      title: string;
      content: string;
      inheritImages?: string[];
      inheritTags?: string[];
      preservedLinks?: string[];
      backLinks?: string[];
    }>;
    mainCardIndex: number;
  }>();

  let backupId: string | undefined;

  try {
    // Critical Step 1: 백업 생성
    const backup = await preBackup(deckName, noteId, "soft");
    backupId = backup.backupId;

    // Critical Step 2: 분할 적용
    const splitResult: SplitResult = {
      originalNoteId: noteId,
      mainCardIndex,
      splitCards: splitCards.map((card) => ({
        title: card.title,
        content: card.content,
        inheritImages: card.inheritImages || [],
        inheritTags: card.inheritTags || [],
        preservedLinks: card.preservedLinks || [],
        backLinks: card.backLinks || [],
      })),
      splitReason: "",
      splitType: "soft",
    };

    const applied = await applySplitResult(deckName, splitResult, []);

    // Critical Step 3: 백업 업데이트
    updateBackupWithCreatedNotes(backupId, applied.newNoteIds);

    // Non-critical: 학습 데이터 복제 (실패해도 롤백하지 않음)
    let schedulingWarning: string | undefined;
    try {
      const newCardIds: number[] = [];
      for (const nid of applied.newNoteIds) {
        const cardIds = await findCardsByNote(nid);
        newCardIds.push(...cardIds);
      }
      if (newCardIds.length > 0) {
        await cloneSchedulingAfterSplit(noteId, newCardIds);
      }
    } catch (schedError) {
      schedulingWarning = "스케줄링 복제 실패 (카드 분할은 정상 완료)";
      console.warn(schedulingWarning, schedError);
    }

    return c.json({
      success: true,
      backupId,
      mainNoteId: applied.mainNoteId,
      newNoteIds: applied.newNoteIds,
      ...(schedulingWarning && { warning: schedulingWarning }),
    });
  } catch (error) {
    // Critical step 실패 → 자동 롤백
    if (backupId) {
      try {
        await rollback(backupId);
      } catch (rollbackErr) {
        console.error("자동 롤백 실패:", rollbackErr);
      }
    }
    throw error;
  }
});

export default app;
