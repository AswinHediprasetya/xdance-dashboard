import apiClient from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';
import type { DashboardMetrics } from '@/types/metrics';
import type { ColumnMapping } from '@/lib/claude';

export interface ProcessResult {
  uploadId: string;
  memberCount: number;
  attendanceCount: number;
  columnMappings: {
    file1: ColumnMapping[];
    file2: ColumnMapping[];
  };
  sampleRows: {
    file1: Record<string, unknown>[];
    file2: Record<string, unknown>[];
  };
  fileNames: {
    file1: string;
    file2: string;
  };
  metrics: DashboardMetrics;
}

export async function processUpload(uploadId: string): Promise<ProcessResult> {
  const response = await apiClient.post<ApiSuccess<ProcessResult>>('/process', { uploadId });
  return response.data.data;
}
