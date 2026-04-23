'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { processUpload } from '../api';
import { uploadKeys, dashboardKeys } from '@/constants/queryKeys';

export function useProcessing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uploadId: string) => processUpload(uploadId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.detail(data.uploadId) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics(data.uploadId) });
    },
  });
}
