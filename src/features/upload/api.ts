import apiClient from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';
import type { UploadResponse } from './types';

export async function uploadFiles(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await apiClient.post<ApiSuccess<UploadResponse>>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.data;
}
