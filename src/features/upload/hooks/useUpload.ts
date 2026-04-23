'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFiles } from '../api';
import { uploadKeys } from '@/constants/queryKeys';

export function useUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => uploadFiles(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.lists() });
    },
  });
}
