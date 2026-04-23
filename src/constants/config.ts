export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ['.xlsx', '.xls'];
export const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

export const PROCESSING_STEPS = [
  { id: 'parse', label: 'Parsing Excel files' },
  { id: 'normalize', label: 'AI schema normalization' },
  { id: 'clean', label: 'Cleaning & deduplicating data' },
  { id: 'compute', label: 'Computing dashboard metrics' },
  { id: 'save', label: 'Saving results' },
] as const;
