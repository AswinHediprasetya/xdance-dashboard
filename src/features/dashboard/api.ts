import apiClient from '@/lib/api-client';
import type { ApiSuccess, ApiListResponse } from '@/types/api';
import type { UploadRecord } from '@/types/upload';
import type { DashboardMetrics } from '@/types/metrics';
import type { NormalizedDataset } from '@/types/member';

export interface UploadDetail {
  id: string;
  fileName1: string;
  fileName2: string;
  status: string;
  metrics: DashboardMetrics;
  normalizedData: NormalizedDataset;
  createdAt: string;
  updatedAt: string;
}

export async function fetchUploadDetail(uploadId: string): Promise<UploadDetail> {
  const response = await apiClient.get<ApiSuccess<UploadDetail>>(`/data/${uploadId}`);
  return response.data.data;
}

export async function fetchUploadList(page = 1): Promise<{ data: UploadRecord[]; meta: any }> {
  const response = await apiClient.get<any>(`/data?page=${page}&per_page=20`);
  return { data: response.data.data, meta: response.data.meta };
}
