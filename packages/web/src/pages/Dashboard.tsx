import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDecks, useDeckStats } from '../hooks/useDecks';
import { api } from '../lib/api';
import { Scissors, FolderOpen, FileStack, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: decksData, isLoading: isLoadingDecks } = useDecks();
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const { data: stats, isLoading: isLoadingStats } = useDeckStats(selectedDeck);

  // 임베딩 상태 조회
  const { data: embeddingStatus, isLoading: isLoadingEmbedding } = useQuery({
    queryKey: ['embedding-status', selectedDeck],
    queryFn: () => api.embedding.status(selectedDeck!),
    enabled: !!selectedDeck,
    staleTime: 30000,
  });

  // 임베딩 생성 뮤테이션
  const generateMutation = useMutation({
    mutationFn: () => api.embedding.generate(selectedDeck!, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embedding-status', selectedDeck] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Anki 카드를 원자적 단위로 분할하세요
        </p>
      </div>

      {/* Deck Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">덱 선택</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDecks ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : (
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedDeck || ''}
              onChange={(e) => setSelectedDeck(e.target.value || null)}
            >
              <option value="">덱을 선택하세요</option>
              {decksData?.decks.map((deck) => (
                <option key={deck} value={deck}>
                  {deck}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {selectedDeck && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 노트</CardTitle>
              <FileStack className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats?.totalNotes || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">분할 후보</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats?.splitCandidates || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hard Split</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isLoadingStats ? '...' : stats?.hardSplitCount || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Soft Split</CardTitle>
              <AlertTriangle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {isLoadingStats ? '...' : stats?.softSplitCount || 0}
              </div>
            </CardContent>
          </Card>

          {/* 임베딩 상태 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">임베딩</CardTitle>
              <Sparkles className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              {isLoadingEmbedding ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : embeddingStatus?.exists ? (
                <div>
                  <div className="text-2xl font-bold text-violet-600">
                    {embeddingStatus.coverage}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {embeddingStatus.totalEmbeddings} / {embeddingStatus.totalNotes}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">없음</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {selectedDeck && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('/split', { state: { deckName: selectedDeck } })}>
              <Scissors className="mr-2 h-4 w-4" />
              분할 시작
            </Button>
            <Button variant="secondary" onClick={() => navigate('/browse', { state: { deckName: selectedDeck } })}>
              <FolderOpen className="mr-2 h-4 w-4" />
              카드 브라우저
            </Button>
            <Button
              variant="outline"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  임베딩 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  임베딩 생성
                  {embeddingStatus?.exists && embeddingStatus.coverage < 100 && (
                    <span className="ml-1 text-xs opacity-70">
                      ({embeddingStatus.coverage}%)
                    </span>
                  )}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
