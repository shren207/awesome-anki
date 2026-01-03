import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDecks } from '../hooks/useDecks';
import { useCards, useCardDetail } from '../hooks/useCards';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function CardBrowser() {
  const location = useLocation();
  const initialDeck = (location.state as { deckName?: string })?.deckName || null;

  const [selectedDeck, setSelectedDeck] = useState<string | null>(initialDeck);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'splitable'>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  const { data: decksData } = useDecks();
  const { data: cardsData, isLoading } = useCards(selectedDeck, { page, limit: 20, filter });
  const { data: cardDetail } = useCardDetail(selectedNoteId);

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">카드 브라우저</h1>
          <p className="text-muted-foreground">덱의 카드를 탐색하고 분석하세요</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedDeck || ''}
            onChange={(e) => {
              setSelectedDeck(e.target.value || null);
              setPage(1);
            }}
          >
            <option value="">덱 선택</option>
            {decksData?.decks.map((deck) => (
              <option key={deck} value={deck}>
                {deck}
              </option>
            ))}
          </select>

          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as 'all' | 'splitable');
              setPage(1);
            }}
          >
            <option value="all">전체</option>
            <option value="splitable">분할 가능</option>
          </select>
        </div>

        {/* Card Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">로딩 중...</div>
            ) : !cardsData?.cards.length ? (
              <div className="p-4 text-center text-muted-foreground">카드가 없습니다</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium">Note ID</th>
                    <th className="p-3 text-left text-sm font-medium">미리보기</th>
                    <th className="p-3 text-left text-sm font-medium">Cloze</th>
                    <th className="p-3 text-left text-sm font-medium">분할 타입</th>
                  </tr>
                </thead>
                <tbody>
                  {cardsData.cards.map((card) => (
                    <tr
                      key={card.noteId}
                      className={cn(
                        'cursor-pointer border-b hover:bg-muted/50',
                        selectedNoteId === card.noteId && 'bg-muted'
                      )}
                      onClick={() => setSelectedNoteId(card.noteId)}
                    >
                      <td className="p-3 font-mono text-sm">{card.noteId}</td>
                      <td className="max-w-md truncate p-3 text-sm">
                        {card.text.replace(/<[^>]*>/g, '').slice(0, 100)}...
                      </td>
                      <td className="p-3 text-sm">{card.clozeStats.totalClozes}</td>
                      <td className="p-3">
                        {card.splitType && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-xs font-medium',
                              card.splitType === 'hard'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            )}
                          >
                            {card.splitType}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {cardsData && cardsData.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {cardsData.total}개 중 {(page - 1) * 20 + 1}-{Math.min(page * 20, cardsData.total)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-2 text-sm">
                {page} / {cardsData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === cardsData.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedNoteId && cardDetail && (
        <Card className="w-96 shrink-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">카드 상세</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSelectedNoteId(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Note ID</h4>
              <p className="font-mono text-sm text-muted-foreground">{cardDetail.noteId}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium">태그</h4>
              <div className="flex flex-wrap gap-1">
                {cardDetail.tags.length > 0 ? (
                  cardDetail.tags.map((tag) => (
                    <span key={tag} className="rounded bg-muted px-2 py-0.5 text-xs">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">없음</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium">분석</h4>
              <ul className="text-sm text-muted-foreground">
                <li>Cloze 개수: {cardDetail.clozeStats.totalClozes}</li>
                <li>Hard Split 가능: {cardDetail.analysis.canHardSplit ? '예' : '아니오'}</li>
                <li>nid 링크: {cardDetail.nidLinks.length}개</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium">내용</h4>
              <div
                className="max-h-64 overflow-auto rounded border bg-muted/50 p-2 text-xs"
                dangerouslySetInnerHTML={{ __html: cardDetail.text }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
