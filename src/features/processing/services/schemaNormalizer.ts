import type { ColumnMapping } from '@/lib/claude';
import { normalizeSchema } from '@/lib/claude';
import type { ParsedSheet } from './excelParser';
import type { CanonicalMember, CanonicalAttendance } from '@/types/member';

const STATUS_MAP: Record<string, string> = {
  actief: 'active',
  active: 'active',
  inactief: 'inactive',
  inactive: 'inactive',
  gepauzeerd: 'paused',
  paused: 'paused',
  geannuleerd: 'cancelled',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

const TYPE_MAP: Record<string, string> = {
  maandelijks: 'monthly',
  monthly: 'monthly',
  kwartaal: 'quarterly',
  quarterly: 'quarterly',
  jaarlijks: 'annual',
  annual: 'annual',
  yearly: 'annual',
  'drop-in': 'drop-in',
  dropin: 'drop-in',
  proef: 'trial',
  trial: 'trial',
};

function toIsoDate(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.split('T')[0];
  // Try parsing DD-MM-YYYY or DD/MM/YYYY
  const m = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return null;
}

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.').replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? null : n;
}

function applyMappings(
  rows: Record<string, unknown>[],
  mappings: ColumnMapping[],
  fileContext: string
): Array<Record<string, unknown>> {
  return rows.map((row, idx) => {
    const out: Record<string, unknown> = {};
    for (const mapping of mappings) {
      if (!mapping.canonicalField) continue;
      const raw = row[mapping.sourceColumn];
      out[mapping.canonicalField] = raw;
    }
    return out;
  });
}

// Column name patterns that indicate personal/sensitive data
const PERSONAL_COL_PATTERNS = [
  /naam|name|voornaam|achternaam|familienaam/i,
  /e[\s-]?mail/i,
  /telefoon|mobiel|tel\.?|phone/i,
  /geboortedatum|geboorte|birth|dob/i,
  /adres|address|straat|postcode|street|city|stad/i,
  /bsn|sofi|passport|iban|rekeningnr/i,
];

function sanitizeSampleRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  if (rows.length === 0) return rows;
  const headers = Object.keys(rows[0]);
  const personalCols = new Set(
    headers.filter(h => PERSONAL_COL_PATTERNS.some(p => p.test(h)))
  );
  return rows.map((row, i) => {
    const out: Record<string, unknown> = { ...row };
    for (const col of personalCols) {
      const val = row[col];
      if (typeof val === 'string' && val.includes('@')) {
        out[col] = `member${i + 1}@example.com`;
      } else {
        out[col] = `Member ${i + 1}`;
      }
    }
    return out;
  });
}

export async function normalizeMembershipFile(
  sheet: ParsedSheet,
  fileContext: string
): Promise<{ mappings: ColumnMapping[]; rows: Record<string, unknown>[] }> {
  const rawSample = sheet.rows.slice(0, 5);
  // Strip personal data before sending to external AI
  const safeSample = sanitizeSampleRows(rawSample);
  const mappings = await normalizeSchema(sheet.headers, safeSample, fileContext);
  const rows = applyMappings(sheet.rows, mappings, fileContext);
  return { mappings, rows };
}

export function rowsToCanonicalMembers(rows: Record<string, unknown>[]): CanonicalMember[] {
  return rows
    .filter((r) => r.firstName || r.lastName || r.email || r.memberId)
    .map((r, idx) => ({
      memberId: String(r.memberId ?? `member-${idx}`),
      firstName: String(r.firstName ?? '').trim(),
      lastName: String(r.lastName ?? '').trim(),
      email: String(r.email ?? '').toLowerCase().trim(),
      phone: r.phone ? String(r.phone).trim() : null,
      dateOfBirth: toIsoDate(r.dateOfBirth),
      membershipType: TYPE_MAP[String(r.membershipType ?? '').toLowerCase().trim()] ?? String(r.membershipType ?? 'unknown').trim(),
      membershipStatus: STATUS_MAP[String(r.membershipStatus ?? '').toLowerCase().trim()] ?? 'active',
      startDate: toIsoDate(r.startDate) ?? new Date().toISOString().split('T')[0],
      endDate: toIsoDate(r.endDate),
      lastCheckIn: toIsoDate(r.lastCheckIn),
      totalCheckIns: toNumber(r.totalCheckIns),
      monthlyFee: toNumber(r.monthlyFee),
      outstandingBalance: toNumber(r.outstandingBalance),
      danceStyle: r.danceStyle ? String(r.danceStyle).trim() : null,
      level: r.level ? String(r.level).toLowerCase().trim() : null,
      notes: r.notes ? String(r.notes).trim() : null,
    }));
}

export function rowsToCanonicalAttendance(rows: Record<string, unknown>[]): CanonicalAttendance[] {
  return rows
    .filter((r) => r.checkInDate || r.className)
    .map((r) => ({
      memberId: r.memberId ? String(r.memberId) : null,
      memberName: r.memberName ? String(r.memberName).trim() : null,
      checkInDate: toIsoDate(r.checkInDate) ?? new Date().toISOString().split('T')[0],
      checkInTime: r.checkInTime ? String(r.checkInTime) : null,
      className: r.className ? String(r.className).trim() : null,
      danceStyle: r.danceStyle ? String(r.danceStyle).trim() : null,
      instructorName: r.instructorName ? String(r.instructorName).trim() : null,
      attendeeCount: toNumber(r.attendeeCount),
    }));
}
