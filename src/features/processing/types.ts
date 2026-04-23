export type ProcessingStepStatus = 'pending' | 'active' | 'done' | 'error';

export interface ProcessingStepState {
  id: string;
  label: string;
  status: ProcessingStepStatus;
}
