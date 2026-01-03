import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDecks, useDeckStats } from '../hooks/useDecks';
import { Scissors, FolderOpen, FileStack, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { data: decksData, isLoading: isLoadingDecks } = useDecks();
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const { data: stats, isLoading: isLoadingStats } = useDeckStats(selectedDeck);

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
        </div>
      )}

      {/* Quick Actions */}
      {selectedDeck && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => navigate('/split', { state: { deckName: selectedDeck } })}>
              <Scissors className="mr-2 h-4 w-4" />
              분할 시작
            </Button>
            <Button variant="secondary" onClick={() => navigate('/browse', { state: { deckName: selectedDeck } })}>
              <FolderOpen className="mr-2 h-4 w-4" />
              카드 브라우저
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
