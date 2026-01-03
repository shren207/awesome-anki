const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API Error: ${res.status}`);
  }
  return res.json();
}

// Types
export interface DeckStats {
  deckName: string;
  totalNotes: number;
  splitCandidates: number;
  hardSplitCount: number;
  softSplitCount: number;
}

export interface CardSummary {
  noteId: number;
  text: string;
  tags: string[];
  modelName: string;
  analysis: {
    canHardSplit: boolean;
    clozeCount: number;
  };
  clozeStats: {
    totalClozes: number;
    uniqueNumbers: number;
  };
  isSplitable: boolean;
  splitType: 'hard' | 'soft' | null;
}

export interface CardDetail extends CardSummary {
  nidLinks: Array<{
    title: string;
    nid: string;
  }>;
  clozes: Array<{
    clozeNumber: number;
    content: string;
    hint?: string;
  }>;
}

export interface SplitPreview {
  noteId: number;
  splitType: 'hard' | 'soft' | 'none';
  originalText?: string;
  splitCards?: Array<{
    title: string;
    content: string;
    isMainCard: boolean;
  }>;
  mainCardIndex?: number;
  splitReason?: string;
  reason?: string;
}

export interface BackupEntry {
  id: string;
  timestamp: string;
  deckName: string;
  originalNoteId: number;
  createdNoteIds: number[];
  splitType: 'hard' | 'soft';
}

// API Functions
export const api = {
  decks: {
    list: () => fetchJson<{ decks: string[] }>('/decks'),
    stats: (name: string) =>
      fetchJson<DeckStats>(`/decks/${encodeURIComponent(name)}/stats`),
  },

  cards: {
    getByDeck: (deck: string, opts?: { page?: number; limit?: number; filter?: string }) => {
      const params = new URLSearchParams();
      if (opts?.page) params.set('page', String(opts.page));
      if (opts?.limit) params.set('limit', String(opts.limit));
      if (opts?.filter) params.set('filter', opts.filter);
      const query = params.toString();
      return fetchJson<{
        cards: CardSummary[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/cards/deck/${encodeURIComponent(deck)}${query ? `?${query}` : ''}`);
    },
    getById: (noteId: number) => fetchJson<CardDetail>(`/cards/${noteId}`),
  },

  split: {
    preview: (noteId: number, useGemini = false) =>
      fetchJson<SplitPreview>('/split/preview', {
        method: 'POST',
        body: JSON.stringify({ noteId, useGemini }),
      }),
    apply: (data: {
      noteId: number;
      deckName: string;
      splitCards: Array<{ title: string; content: string }>;
      mainCardIndex: number;
    }) =>
      fetchJson<{
        success: boolean;
        backupId: string;
        mainNoteId: number;
        newNoteIds: number[];
      }>('/split/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  backup: {
    list: () => fetchJson<{ backups: BackupEntry[]; total: number }>('/backup'),
    latest: () => fetchJson<{ backupId: string | null }>('/backup/latest'),
    rollback: (backupId: string) =>
      fetchJson<{
        success: boolean;
        restoredNoteId?: number;
        deletedNoteIds?: number[];
        error?: string;
      }>(`/backup/${backupId}/rollback`, { method: 'POST' }),
  },

  health: () => fetchJson<{ status: string; timestamp: string }>('/health'),
};
