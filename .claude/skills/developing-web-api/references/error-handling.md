# API 에러 핸들링

## 아키텍처

글로벌 `app.onError` 미들웨어가 모든 에러를 중앙 처리. 라우트에서는 try/catch 없이 에러를 throw.

## 에러 클래스 계층 (packages/core/src/errors.ts)

```
AppError (base) — statusCode, message
├── NotFoundError     (404)
├── ValidationError   (400)
├── AnkiConnectError  (502)
└── TimeoutError      (504)
```

## 글로벌 에러 핸들러 (packages/server/src/index.ts)

```typescript
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode);
  }
  return c.json({ error: "Internal server error" }, 500);
});
```

- `AppError` 인스턴스 → 해당 statusCode + 메시지 반환
- 그 외 → 500 + generic 메시지 (내부 에러 노출 방지)

## 라우트에서 에러 throw 패턴

```typescript
import { NotFoundError, ValidationError } from "@anki-splitter/core";

app.get("/:noteId", async (c) => {
  const noteId = parseInt(c.req.param("noteId"), 10);
  const note = await getNoteById(noteId);

  if (!note) {
    throw new NotFoundError(`노트 ${noteId}를 찾을 수 없습니다`);
  }

  return c.json({ noteId: note.noteId, ... });
});
```

- try/catch 불필요 — 에러가 글로벌 핸들러로 전파됨
- AnkiConnect 에러(TimeoutError, AnkiConnectError)는 client.ts에서 자동 throw

## Gemini API 에러

- API 키 미설정: `.env`에 `GEMINI_API_KEY` 확인
- 요청 제한: API quota 초과 시 재시도 로직 필요 (미구현)
