import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type SplitPreviewResult, type SplitApplyResult } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

export function useSplitPreview() {
  return useMutation({
    mutationFn: ({
      noteId,
      splitType,
    }: {
      noteId: number;
      splitType: 'hard' | 'soft';
    }) => api.split.preview(noteId, splitType),
  });
}

export function useSplitApply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      splitType,
      deckName,
    }: {
      noteId: number;
      splitType: 'hard' | 'soft';
      deckName: string;
    }) => api.split.apply(noteId, splitType, deckName),
    onSuccess: (_, variables) => {
      // 카드 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      // 백업 목록도 새로고침
      queryClient.invalidateQueries({ queryKey: queryKeys.backups.all });
    },
  });
}

export type { SplitPreviewResult, SplitApplyResult };
