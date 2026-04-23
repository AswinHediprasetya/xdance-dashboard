import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseExcelBuffer } from '@/features/processing/services/excelParser';
import { successCreatedResponse, errorResponse, serverError } from '@/lib/api-helpers';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/constants/config';

// Magic bytes for xlsx (PK zip) and xls (D0 CF)
function isValidExcelBytes(buffer: Buffer): boolean {
  const xls = buffer[0] === 0xd0 && buffer[1] === 0xcf;
  const xlsx = buffer[0] === 0x50 && buffer[1] === 0x4b;
  return xls || xlsx;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    const validationErrors: { field: string; message: string }[] = [];

    if (files.length !== 2) {
      validationErrors.push({ field: 'files', message: 'Exactly 2 Excel files are required.' });
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls'].includes(ext ?? '')) {
        validationErrors.push({
          field: `files[${i}]`,
          message: `"${file.name}" is not a valid Excel file. Only .xlsx and .xls are accepted.`,
        });
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        validationErrors.push({
          field: `files[${i}]`,
          message: `"${file.name}" exceeds the 10MB size limit.`,
        });
      }
      if (file.size === 0) {
        validationErrors.push({ field: `files[${i}]`, message: `"${file.name}" is empty.` });
      }
    }

    if (validationErrors.length > 0) {
      return errorResponse('File validation failed.', 'VALIDATION_ERROR', 400, validationErrors);
    }

    const buffers = await Promise.all(files.map((f) => f.arrayBuffer().then(Buffer.from)));

    for (let i = 0; i < buffers.length; i++) {
      if (!isValidExcelBytes(buffers[i])) {
        return errorResponse(
          `"${files[i].name}" does not appear to be a valid Excel file.`,
          'VALIDATION_ERROR',
          400,
          [{ field: `files[${i}]`, message: 'File content does not match Excel format.' }]
        );
      }
    }

    // Parse to validate structure
    let parsed1, parsed2;
    try {
      parsed1 = parseExcelBuffer(buffers[0], files[0].name);
      parsed2 = parseExcelBuffer(buffers[1], files[1].name);
    } catch (err) {
      return errorResponse(
        'Could not parse one or more files. Please check the format and try again.',
        'FILE_PARSE_ERROR',
        422
      );
    }

    if (parsed1.primarySheet.rows.length === 0 || parsed2.primarySheet.rows.length === 0) {
      return errorResponse(
        'One or more files contain no data rows. Please check the file content.',
        'VALIDATION_ERROR',
        422
      );
    }

    const upload = await prisma.upload.create({
      data: {
        fileName1: files[0].name,
        fileName2: files[1].name,
        status: 'pending',
        rawData1: JSON.stringify(parsed1),
        rawData2: JSON.stringify(parsed2),
      },
    });

    return successCreatedResponse(
      {
        uploadId: upload.id,
        fileName1: upload.fileName1,
        fileName2: upload.fileName2,
        status: upload.status,
        createdAt: upload.createdAt,
      },
      'Files uploaded successfully. Ready to process.'
    );
  } catch (err) {
    return serverError('POST /api/upload', err);
  }
}
