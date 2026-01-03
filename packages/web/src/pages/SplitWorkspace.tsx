/**
 * SplitWorkspace - 카드 분할 작업 공간
 * 3단 레이아웃: 후보 목록 | 원본 카드 | 분할 미리보기
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ContentRenderer } from '../components/card/ContentRenderer';
import { DiffViewer, SplitPreviewCard } from '../components/card/DiffViewer';
import { useDecks } from '../hooks/useDecks';
import { useCards } from '../hooks/useCards';
import { useSplitPreview, useSplitApply } from '../hooks/useSplit';
import { cn } from '../lib/utils';
import {
  Scissors,
  ChevronRight,
  Loader2,
  Check,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SplitCandidate {
  noteId: number;
  text: string;
  analysis: {
    canHardSplit: boolean;
    canSoftSplit: boolean;
    clozeCount: number;
  };
}

export function SplitWorkspace() {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<SplitCandidate | null>(null);
  const [splitType, setSplitType] = useState<'hard' | 'soft'>('hard');

  const { data: decksData } = useDecks();
  const { data: cardsData, isLoading: isLoadingCards } = useCards(selectedDeck, {
    limit: 100,
    filter: 'split_candidates',
  });

  const splitPreview = useSplitPreview();
  const splitApply = useSplitApply();

  // 덱 선택 시 첫 번째 덱 자동 선택
  useEffect(() => {
    if (decksData?.decks && decksData.decks.length > 0 && !selectedDeck) {
      setSelectedDeck(decksData.decks[0]);
    }
  }, [decksData, selectedDeck]);

  // 카드 선택 시 자동으로 분할 미리보기 요청
  useEffect(() => {
    if (selectedCard) {
      // 분할 타입 자동 선택
      const type = selectedCard.analysis.canHardSplit ? 'hard' : 'soft';
      setSplitType(type);

      // 미리보기 요청
      splitPreview.mutate({ noteId: selectedCard.noteId, splitType: type });
    }
  }, [selectedCard?.noteId]);

  const candidates = (cardsData?.cards || []).filter(
    (c: any) => c.analysis?.canHardSplit || c.analysis?.canSoftSplit
  ) as SplitCandidate[];

  const handleApply = () => {
    if (!selectedCard || !selectedDeck) return;

    splitApply.mutate(
      {
        noteId: selectedCard.noteId,
        splitType,
        deckName: selectedDeck,
      },
      {
        onSuccess: () => {
          // 성공 후 목록에서 제거하고 다음 카드 선택
          const nextCard = candidates.find((c) => c.noteId !== selectedCard.noteId);
          setSelectedCard(nextCard || null);
        },
      }
    );
  };

  const handleSwitchSplitType = () => {
    const newType = splitType === 'hard' ? 'soft' : 'hard';
    setSplitType(newType);
    if (selectedCard) {
      splitPreview.mutate({ noteId: selectedCard.noteId, splitType: newType });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">분할 작업</h1>
          <select
            value={selectedDeck || ''}
            onChange={(e) => {
              setSelectedDeck(e.target.value);
              setSelectedCard(null);
            }}
            className="px-3 py-1.5 border rounded-md bg-background text-sm"
          >
            {decksData?.decks?.map((deck) => (
              <option key={deck} value={deck}>
                {deck}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {candidates.length}개 분할 후보
          </span>
        </div>
      </div>

      {/* 3단 레이아웃 */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* 왼쪽: 후보 목록 */}
        <div className="col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-3 px-4 border-b shrink-0">
              <CardTitle className="text-sm">분할 후보</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {isLoadingCards ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  분할 후보가 없습니다
                </div>
              ) : (
                <div className="divide-y">
                  {candidates.map((card) => (
                    <button
                      key={card.noteId}
                      onClick={() => setSelectedCard(card)}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-muted transition-colors',
                        selectedCard?.noteId === card.noteId && 'bg-primary/10'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {card.noteId}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {card.text.slice(0, 60)}...
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {card.analysis.canHardSplit && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              <Zap className="w-3 h-3 inline mr-0.5" />
                              Hard
                            </span>
                          )}
                          {card.analysis.canSoftSplit && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                              <Sparkles className="w-3 h-3 inline mr-0.5" />
                              Soft
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 중앙: 원본 카드 */}
        <div className="col-span-5 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-3 px-4 border-b shrink-0 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">원본 카드</CardTitle>
              {selectedCard && (
                <span className="text-xs text-muted-foreground">
                  NID: {selectedCard.noteId}
                </span>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {selectedCard ? (
                <ContentRenderer
                  content={selectedCard.text}
                  showToggle={true}
                  defaultView="rendered"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <ChevronRight className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>왼쪽에서 카드를 선택하세요</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 분할 미리보기 */}
        <div className="col-span-4 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="py-3 px-4 border-b shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">분할 미리보기</CardTitle>
                {selectedCard && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSwitchSplitType}
                      className={cn(
                        'text-xs px-2 py-1 rounded transition-colors',
                        splitType === 'hard'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      )}
                    >
                      {splitType === 'hard' ? (
                        <>
                          <Zap className="w-3 h-3 inline mr-1" />
                          Hard Split
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          Soft Split
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {!selectedCard ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>카드를 선택하면 분할 미리보기가 표시됩니다</p>
                </div>
              ) : splitPreview.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : splitPreview.isError ? (
                <div className="flex items-center justify-center h-full text-destructive">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span>분할 분석 실패</span>
                </div>
              ) : splitPreview.data ? (
                <div className="space-y-4">
                  {/* 분할 요약 */}
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p className="font-medium mb-1">
                      {splitPreview.data.splitCards.length}개 카드로 분할
                    </p>
                    {splitPreview.data.splitReason && (
                      <p className="text-muted-foreground text-xs">
                        {splitPreview.data.splitReason}
                      </p>
                    )}
                  </div>

                  {/* 분할 카드 미리보기 */}
                  <div className="space-y-3">
                    {splitPreview.data.splitCards.map((card, idx) => (
                      <SplitPreviewCard
                        key={idx}
                        card={card}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>

            {/* 적용 버튼 */}
            {selectedCard && splitPreview.data && (
              <div className="px-4 py-3 border-t shrink-0">
                <Button
                  onClick={handleApply}
                  disabled={splitApply.isPending}
                  className="w-full"
                >
                  {splitApply.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      적용 중...
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4 mr-2" />
                      분할 적용
                    </>
                  )}
                </Button>
                {splitApply.isSuccess && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    분할이 적용되었습니다
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
