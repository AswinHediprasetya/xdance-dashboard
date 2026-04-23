'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUploadDetail, fetchUploadList } from '../api';
import { dashboardKeys, uploadKeys } from '@/constants/queryKeys';

export function useDashboardData(uploadId: string) {
  return useQuery({
    queryKey: dashboardKeys.metrics(uploadId),
    queryFn: () => fetchUploadDetail(uploadId),
    enabled: !!uploadId,
  });
}

export function useUploadList(page = 1) {
  return useQuery({
    queryKey: uploadKeys.list({ page }),
    queryFn: () => fetchUploadList(page),
  });
}
