import type { ErrorCode } from '@/types/api';

export function successResponse<T>(data: T, message = 'OK', status = 200) {
  return Response.json({ success: true, message, data }, { status });
}

export function successCreatedResponse<T>(data: T, message = 'Created successfully') {
  return Response.json({ success: true, message, data }, { status: 201 });
}

export function errorResponse(
  message: string,
  code: ErrorCode,
  status: number,
  errors?: { field: string; message: string }[]
) {
  const body: Record<string, unknown> = { success: false, message, code };
  if (errors) body.errors = errors;
  return Response.json(body, { status });
}

export function serverError(context: string, err: unknown) {
  console.error(`[SERVER_ERROR] ${context}:`, err);
  return errorResponse('An unexpected error occurred. Please try again.', 'SERVER_ERROR', 500);
}
