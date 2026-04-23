import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectFileContext } from '@/features/processing/services/excelParser';
import {
  normalizeMembershipFile,
  rowsToCanonicalMembers,
  rowsToCanonicalAttendance,
} from '@/features/processing/services/schemaNormalizer';
import { computeMetrics } from '@/features/processing/services/metricsComputer';
import { successResponse, errorResponse, serverError } from '@/lib/api-helpers';
import type { ParsedFile } from '@/features/processing/services/excelParser';

export async function POST(request: NextRequest) {
  let uploadId: string | undefined;

  try {
    const body = await request.json();
    uploadId = body?.uploadId;

    if (!uploadId || typeof uploadId !== 'string') {
      return errorResponse('uploadId is required.', 'VALIDATION_ERROR', 400);
    }

    const upload = await prisma.upload.findUnique({ where: { id: uploadId } });
    if (!upload) {
      return errorResponse('Upload not found.', 'NOT_FOUND', 404);
    }

    if (upload.status === 'completed') {
      return successResponse(
        { uploadId, metrics: JSON.parse(upload.metrics!), normalizedData: JSON.parse(upload.normalizedData!) },
        'Already processed.'
      );
    }

    // Mark as processing
    await prisma.upload.update({ where: { id: uploadId }, data: { status: 'processing' } });

    const parsed1: ParsedFile = JSON.parse(upload.rawData1);
    const parsed2: ParsedFile = JSON.parse(upload.rawData2);

    // Step 2: AI normalization
    let norm1, norm2;
    try {
      const ctx1 = detectFileContext(parsed1.primarySheet.headers, parsed1.fileName);
      const ctx2 = detectFileContext(parsed2.primarySheet.headers, parsed2.fileName);
      [norm1, norm2] = await Promise.all([
        normalizeMembershipFile(parsed1.primarySheet, ctx1),
        normalizeMembershipFile(parsed2.primarySheet, ctx2),
      ]);
    } catch (err) {
      await prisma.upload.update({
        where: { id: uploadId },
        data: { status: 'failed', errorMessage: 'AI normalization failed. Please try again.' },
      });
      return errorResponse(
        'AI schema normalization failed. Please try again in a moment.',
        'NORMALIZATION_ERROR',
        422
      );
    }

    // Step 3: Classify and clean
    const ctx1 = detectFileContext(parsed1.primarySheet.headers, parsed1.fileName);
    const ctx2 = detectFileContext(parsed2.primarySheet.headers, parsed2.fileName);

    let members, attendance;
    if (ctx1 === 'membership_list' && ctx2 === 'attendance_log') {
      members = rowsToCanonicalMembers(norm1.rows);
      attendance = rowsToCanonicalAttendance(norm2.rows);
    } else if (ctx2 === 'membership_list' && ctx1 === 'attendance_log') {
      members = rowsToCanonicalMembers(norm2.rows);
      attendance = rowsToCanonicalAttendance(norm1.rows);
    } else {
      // Treat first as membership, second as attendance
      members = rowsToCanonicalMembers(norm1.rows);
      attendance = rowsToCanonicalAttendance(norm2.rows);
    }

    // Deduplicate members by memberId
    const seenIds = new Set<string>();
    members = members.filter((m) => {
      if (seenIds.has(m.memberId)) return false;
      seenIds.add(m.memberId);
      return true;
    });

    // Step 4: Compute metrics
    let metrics;
    try {
      metrics = computeMetrics(members, attendance);
    } catch (err) {
      await prisma.upload.update({
        where: { id: uploadId },
        data: { status: 'failed', errorMessage: 'Metrics computation failed.' },
      });
      return errorResponse(
        'Could not compute dashboard metrics. Please check the file content.',
        'PROCESSING_ERROR',
        422
      );
    }

    const normalizedData = {
      members,
      attendance,
      columnMappings: { file1: norm1.mappings, file2: norm2.mappings },
    };

    // Step 5: Persist
    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: 'completed',
        normalizedData: JSON.stringify(normalizedData),
        metrics: JSON.stringify(metrics),
        errorMessage: null,
      },
    });

    return successResponse(
      {
        uploadId,
        memberCount: members.length,
        attendanceCount: attendance.length,
        columnMappings: normalizedData.columnMappings,
        sampleRows: {
          file1: norm1.rows.slice(0, 5),
          file2: norm2.rows.slice(0, 5),
        },
        fileNames: {
          file1: parsed1.fileName,
          file2: parsed2.fileName,
        },
        metrics,
      },
      'Processing complete.'
    );
  } catch (err) {
    if (uploadId) {
      await prisma.upload
        .update({
          where: { id: uploadId },
          data: { status: 'failed', errorMessage: 'An unexpected error occurred.' },
        })
        .catch(() => {});
    }
    return serverError('POST /api/process', err);
  }
}
