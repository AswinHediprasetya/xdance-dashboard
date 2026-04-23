export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiSuccessList<T> {
  success: true;
  message: string;
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code: ErrorCode;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
export type ApiListResponse<T> = ApiSuccessList<T> | ApiError;

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'FILE_PARSE_ERROR'
  | 'NORMALIZATION_ERROR'
  | 'PROCESSING_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR';
