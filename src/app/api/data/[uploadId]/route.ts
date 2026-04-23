import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, serverError } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId } = await params;

    const upload = await prisma.upload.findUnique({ where: { id: uploadId } });
    if (!upload) {
      return errorResponse('Upload not found.', 'NOT_FOUND', 404);
    }

    if (upload.status !== 'completed') {
      return successResponse(
        {
          id: upload.id,
          fileName1: upload.fileName1,
          fileName2: upload.fileName2,
          status: upload.status,
          errorMessage: upload.errorMessage,
          createdAt: upload.createdAt,
          updatedAt: upload.updatedAt,
        },
        `Upload status: ${upload.status}`
      );
    }

    const metrics = JSON.parse(upload.metrics!);
    const normalizedData = JSON.parse(upload.normalizedData!);

    return successResponse(
      {
        id: upload.id,
        fileName1: upload.fileName1,
        fileName2: upload.fileName2,
        status: upload.status,
        metrics,
        normalizedData,
        createdAt: upload.createdAt,
        updatedAt: upload.updatedAt,
      },
      'OK'
    );
  } catch (err) {
    return serverError('GET /api/data/[uploadId]', err);
  }
}
