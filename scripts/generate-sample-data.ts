/**
 * Generates sample Excel files for the X-Dance Dashboard demo.
 * Run with: npx tsx scripts/generate-sample-data.ts
 *
 * Produces:
 *   public/sample-data/ledenlijst-demo.xlsx  — 50 members, Dutch headers
 *   public/sample-data/aanwezigheid-demo.xlsx — 200 attendance records, Dutch headers
 */

import * as XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'sample-data');

// Dutch first/last names pool
const FIRST_NAMES = [
  'Sanne', 'Emma', 'Lotte', 'Sophie', 'Julia', 'Anna', 'Laura', 'Fleur',
  'Lisa', 'Nina', 'Mila', 'Sara', 'Nora', 'Iris', 'Roos',
  'Lars', 'Daan', 'Joost', 'Niels', 'Tom', 'Bram', 'Tim', 'Rick',
  'Sven', 'Jesse', 'Finn', 'Luuk', 'Jens', 'Thijs', 'Ruben',
];

const LAST_NAMES = [
  'de Vries', 'Bakker', 'Janssen', 'Smit', 'Meijer', 'de Boer', 'van Dijk',
  'Visser', 'Mulder', 'Peters', 'Jacobs', 'Hendriks', 'van der Berg', 'Dekker',
  'Brouwer', 'Willems', 'Leeuw', 'Kuiper', 'Peeters', 'Vermeer',
];

const DANCE_STYLES = ['Salsa', 'Bachata', 'Kizomba', 'Zouk', 'Tango', 'Merengue'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const MEMBERSHIP_TYPES = ['Maandabonnement', 'Kwartaalabonnement', 'Jaarabonnement', 'Proefles'];
const STATUSES = ['Actief', 'Inactief', 'Gepauzeerd'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function randomDate(start: Date, end: Date): Date {
  const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ms);
}

// ─── Generate Members ───────────────────────────────────────────────────────

interface MemberRow {
  Lidnummer: string;
  Voornaam: string;
  Achternaam: string;
  E_mailadres: string;
  Telefoonnummer: string;
  Geboortedatum: string;
  Abonnementstype: string;
  Status: string;
  Startdatum: string;
  Einddatum: string;
  Dansstijl: string;
  Niveau: string;
  Maandelijkse_kosten: number;
  Openstaand_saldo: number;
  Laatste_inchecktijd: string;
  Aantal_incheckbeurten: number;
  Opmerkingen: string;
}

function generateMembers(count: number): MemberRow[] {
  const rows: MemberRow[] = [];
  const now = new Date('2025-04-01');

  for (let i = 1; i <= count; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const membershipType = randomItem(MEMBERSHIP_TYPES);
    const status = Math.random() < 0.75 ? 'Actief' : randomItem(['Inactief', 'Gepauzeerd']);
    const startDate = randomDate(new Date('2023-01-01'), new Date('2025-01-01'));
    const monthlyFee = membershipType === 'Maandabonnement' ? 45
      : membershipType === 'Kwartaalabonnement' ? 40
      : membershipType === 'Jaarabonnement' ? 35
      : 15;

    let endDate: Date;
    if (membershipType === 'Maandabonnement') endDate = addDays(startDate, 30);
    else if (membershipType === 'Kwartaalabonnement') endDate = addDays(startDate, 90);
    else if (membershipType === 'Jaarabonnement') endDate = addDays(startDate, 365);
    else endDate = addDays(startDate, 7);

    const totalCheckins = status === 'Actief' ? randomInt(1, 80) : randomInt(0, 20);
    const lastCheckin = totalCheckins > 0
      ? formatDate(randomDate(addDays(now, -90), now))
      : '';

    rows.push({
      Lidnummer: `LD${String(1000 + i).padStart(5, '0')}`,
      Voornaam: firstName,
      Achternaam: lastName,
      E_mailadres: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')
        .replace(/'/g, '')}${randomInt(1, 99)}@email.nl`,
      Telefoonnummer: `06${randomInt(10000000, 99999999)}`,
      Geboortedatum: formatDate(randomDate(new Date('1975-01-01'), new Date('2005-01-01'))),
      Abonnementstype: membershipType,
      Status: status,
      Startdatum: formatDate(startDate),
      Einddatum: formatDate(endDate),
      Dansstijl: randomItem(DANCE_STYLES),
      Niveau: randomItem(LEVELS),
      Maandelijkse_kosten: monthlyFee,
      Openstaand_saldo: Math.random() < 0.15 ? parseFloat((Math.random() * 120).toFixed(2)) : 0,
      Laatste_inchecktijd: lastCheckin,
      Aantal_incheckbeurten: totalCheckins,
      Opmerkingen: Math.random() < 0.2 ? 'Vaste klant' : '',
    });
  }

  return rows;
}

// ─── Generate Attendance ─────────────────────────────────────────────────────

interface AttendanceRow {
  Inchecknummer: string;
  Lidnummer: string;
  Naam: string;
  Dansstijl: string;
  Lesniveau: string;
  Datum: string;
  Tijdstip: string;
  Locatie: string;
  Docent: string;
}

const TEACHERS = ['Hani Andary', 'Marco Reyes', 'Sofia Lima', 'Yara van den Berg'];
const LOCATIONS = ['Studio A', 'Studio B', 'Hoofdzaal'];

function generateAttendance(members: MemberRow[], count: number): AttendanceRow[] {
  const rows: AttendanceRow[] = [];
  const now = new Date('2025-04-01');
  const activeMembers = members.filter((m) => m.Status === 'Actief');

  for (let i = 1; i <= count; i++) {
    const member = randomItem(activeMembers.length > 0 ? activeMembers : members);
    const date = randomDate(addDays(now, -180), now);
    const hour = randomInt(10, 21);
    const minute = randomItem([0, 15, 30, 45]);

    rows.push({
      Inchecknummer: `IC${String(10000 + i).padStart(6, '0')}`,
      Lidnummer: member.Lidnummer,
      Naam: `${member.Voornaam} ${member.Achternaam}`,
      Dansstijl: member.Dansstijl,
      Lesniveau: member.Niveau,
      Datum: formatDate(date),
      Tijdstip: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      Locatie: randomItem(LOCATIONS),
      Docent: randomItem(TEACHERS),
    });
  }

  // Sort by date ascending
  rows.sort((a, b) => a.Datum.localeCompare(b.Datum));
  return rows;
}

// ─── Write Excel files ───────────────────────────────────────────────────────

function writeExcel(rows: object[], filePath: string, sheetName: string) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filePath);
  console.log(`✓ Written: ${filePath} (${rows.length} rows)`);
}

const members = generateMembers(50);
const attendance = generateAttendance(members, 200);

writeExcel(members, path.join(OUT_DIR, 'ledenlijst-demo.xlsx'), 'Ledenlijst');
writeExcel(attendance, path.join(OUT_DIR, 'aanwezigheid-demo.xlsx'), 'Aanwezigheid');

console.log('Sample data generation complete.');
