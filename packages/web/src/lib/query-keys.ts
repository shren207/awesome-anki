export const queryKeys = {
  decks: ['decks'] as const,
  deckStats: (name: string) => ['decks', name, 'stats'] as const,

  cards: {
    all: ['cards'] as const,
    byDeck: (deck: string, opts?: { page?: number; filter?: string }) =>
      ['cards', 'deck', deck, opts] as const,
    detail: (noteId: number) => ['cards', 'detail', noteId] as const,
  },

  split: {
    preview: (noteId: number, useGemini?: boolean) =>
      ['split', 'preview', noteId, useGemini] as const,
  },

  backups: ['backups'] as const,

  health: ['health'] as const,
};
