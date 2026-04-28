import { NextResponse } from 'next/server';

const PII_KEYS = new Set(['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'memberId', 'notes', 'outstandingBalance']);
function stripPii(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = PII_KEYS.has(k) ? '●●●' : v;
  }
  return out;
}
import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';
import { parseExcelBuffer } from '@/features/processing/services/excelParser';
import { detectFileContext } from '@/features/processing/services/excelParser';
import {
  normalizeMembershipFile,
  rowsToCanonicalMembers,
  rowsToCanonicalAttendance,
} from '@/features/processing/services/schemaNormalizer';
import { computeMetrics } from '@/features/processing/services/metricsComputer';
import { successResponse, serverError } from '@/lib/api-helpers';

const SAMPLE_DIR = path.join(process.cwd(), 'public', 'sample-data');
const FILE1 = 'ledenlijst-demo.xlsx';
const FILE2 = 'aanwezigheid-demo.xlsx';

export async function POST() {
  try {
    const file1Path = path.join(SAMPLE_DIR, FILE1);
    const file2Path = path.join(SAMPLE_DIR, FILE2);

    if (!fs.existsSync(file1Path) || !fs.existsSync(file2Path)) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Sample data files not found. Run: npx tsx scripts/generate-sample-data.ts' } },
        { status: 404 }
      );
    }

    const buf1 = Buffer.from(fs.readFileSync(file1Path));
    const buf2 = Buffer.from(fs.readFileSync(file2Path));

    const parsed1 = parseExcelBuffer(buf1, FILE1);
    const parsed2 = parseExcelBuffer(buf2, FILE2);

    const ctx1 = detectFileContext(parsed1.primarySheet.headers, parsed1.fileName);
    const ctx2 = detectFileContext(parsed2.primarySheet.headers, parsed2.fileName);

    const [norm1, norm2] = await Promise.all([
      normalizeMembershipFile(parsed1.primarySheet, ctx1),
      normalizeMembershipFile(parsed2.primarySheet, ctx2),
    ]);

    let members, attendance;
    if (ctx1 === 'membership_list' && ctx2 === 'attendance_log') {
      members = rowsToCanonicalMembers(norm1.rows);
      attendance = rowsToCanonicalAttendance(norm2.rows);
    } else if (ctx2 === 'membership_list' && ctx1 === 'attendance_log') {
      members = rowsToCanonicalMembers(norm2.rows);
      attendance = rowsToCanonicalAttendance(norm1.rows);
    } else {
      members = rowsToCanonicalMembers(norm1.rows);
      attendance = rowsToCanonicalAttendance(norm2.rows);
    }

    const seenIds = new Set<string>();
    members = members.filter((m) => {
      if (seenIds.has(m.memberId)) return false;
      seenIds.add(m.memberId);
      return true;
    });

    const metrics = computeMetrics(members, attendance);

    const normalizedData = {
      members,
      attendance,
      columnMappings: { file1: norm1.mappings, file2: norm2.mappings },
    };

    const upload = await prisma.upload.create({
      data: {
        fileName1: FILE1,
        fileName2: FILE2,
        status: 'completed',
        rawData1: JSON.stringify(parsed1),
        rawData2: JSON.stringify(parsed2),
        normalizedData: JSON.stringify(normalizedData),
        metrics: JSON.stringify(metrics),
      },
    });

    return successResponse(
      {
        uploadId: upload.id,
        memberCount: members.length,
        attendanceCount: attendance.length,
        columnMappings: normalizedData.columnMappings,
        sampleRows: {
          file1: norm1.rows.slice(0, 5).map(stripPii),
          file2: norm2.rows.slice(0, 5).map(stripPii),
        },
        fileNames: {
          file1: FILE1,
          file2: FILE2,
        },
        metrics,
      },
      'Sample data processed successfully.'
    );
  } catch (err) {
    return serverError('POST /api/process-sample', err);
  }
}
