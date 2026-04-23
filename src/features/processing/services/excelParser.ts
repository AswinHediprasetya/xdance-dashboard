import * as XLSX from 'xlsx';

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, unknown>[];
  rawRows: unknown[][];
  sheetName: string;
}

export interface ParsedFile {
  fileName: string;
  sheets: ParsedSheet[];
  primarySheet: ParsedSheet;
}

export function parseExcelBuffer(buffer: Buffer, fileName: string): ParsedFile {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

  if (workbook.SheetNames.length === 0) {
    throw new Error('FILE_EMPTY');
  }

  const sheets: ParsedSheet[] = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });

    if (rawRows.length < 2) {
      return { headers: [], rows: [], rawRows: [], sheetName: name };
    }

    const headers = (rawRows[0] as unknown[]).map((h) =>
      h != null ? String(h).trim() : ''
    );
    const dataRows = rawRows.slice(1).filter((row) =>
      (row as unknown[]).some((cell) => cell != null && cell !== '')
    );

    const rows = dataRows.map((row) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header, i) => {
        if (header) obj[header] = (row as unknown[])[i] ?? null;
      });
      return obj;
    });

    return { headers, rows, rawRows: dataRows, sheetName: name };
  });

  const primarySheet = sheets.find((s) => s.rows.length > 0) ?? sheets[0];

  return { fileName, sheets, primarySheet };
}

export function detectFileContext(headers: string[], fileName: string): string {
  const lower = headers.map((h) => h.toLowerCase()).join(' ');
  const nameLower = fileName.toLowerCase();

  if (
    nameLower.includes('attendance') ||
    nameLower.includes('checkin') ||
    nameLower.includes('aanwezig') ||
    lower.includes('check') ||
    lower.includes('les') ||
    lower.includes('class')
  ) {
    return 'attendance_log';
  }
  return 'membership_list';
}
