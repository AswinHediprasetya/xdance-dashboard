import { successResponse, serverError } from '@/lib/api-helpers';
import { parseLessonFile } from '@/lib/lessonParser';

export async function GET() {
  try {
    const data = parseLessonFile();
    return successResponse(data, 'Lesson analysis loaded.');
  } catch (err) {
    return serverError('GET /api/lessons', err);
  }
}
