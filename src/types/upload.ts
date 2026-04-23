export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UploadRecord {
  id: string;
  fileName1: string;
  fileName2: string;
  status: UploadStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}
