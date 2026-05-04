import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export interface LessonClass {
  className: string;
  teacher: string;
  location: string;
  students: number;
  profitLoss: number;
  turnover: number;
  teacherExpense: number;
  rent: number;
  duration: number;
  turnoverPerStudent: number;
  day: string;
  classTime: number;
  breakEvenStudents: number;
  profitPerStudent: number;
}

export interface LocationStat {
  location: string;
  avgProfit: number;
  avgGroupSize: number;
  totalRevenue: number;
  totalStudents: number;
  costPerHour: number;
  monthlyRent: number | null;
  lessons: number;
}

export interface TeacherStat {
  teacher: string;
  totalProfit: number;
  profitPerHour: number;
  hours: number;
  hourlyRate: number;
  travelCost: number;
  roi: number; // profit per €1 of teacher cost
}

export interface DayStat {
  day: string;
  totalRevenue: number;
  totalPL: number;
  avgStudents: number;
  classes: number;
  avgPL: number;
}

export interface LessonSummary {
  classes: LessonClass[];
  locations: LocationStat[];
  teachers: TeacherStat[];
  days: DayStat[];
  kpi: {
    totalClasses: number;
    totalRevenue: number;
    netPL: number;
    profitableClasses: number;
    avgStudents: number;
    totalTeacherCost: number;
    totalRentCost: number;
    dataDate: string;
  };
}

// Anonymize teacher surnames for GDPR compliance (EU)
// "Iris Heising" → "Iris H." | "Imaury" → "Imaury" | "Jolijn & Indy" → "Jolijn & Indy"
export function anonymizeTeacher(name: string): string {
  if (!name) return 'Unknown';
  const trimmed = name.trim();
  if (trimmed.includes('&')) {
    return trimmed.split('&').map(n => n.trim().split(/\s+/)[0]).join(' & ');
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts.slice(1).map(p => p[0].toUpperCase() + '.').join(' ')}`;
}

const DAY_ORDER: Record<string, number> = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6,
};

export function parseLessonFile(): LessonSummary {
  const filePath = path.join(process.cwd(), 'public', 'data', 'lesanalyse.xlsx');
  if (!fs.existsSync(filePath)) throw new Error('Lesson analysis file not found');

  const buffer = fs.readFileSync(filePath);
  const wb = XLSX.read(buffer, { type: 'buffer' });

  // --- Master sheet ---
  const masterRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Master'], { defval: null });

  const classes: LessonClass[] = masterRaw
    .filter(r => r['Classname'])
    .map(r => {
      const students = Number(r['AmountStudents']) || 0;
      const turnover = Number(r['Turnover']) || 0;
      const teacherExpense = Number(r['Expense Teacher']) || 0;
      const rent = Number(r['Rent']) || 0;
      const tps = Number(r['Turnover / student']) || (students > 0 ? turnover / students : 0);
      const breakEven = tps > 0 ? Math.ceil((teacherExpense + rent) / tps) : 0;

      return {
        className: String(r['Classname']).trim(),
        teacher: anonymizeTeacher(String(r['Teacher'] ?? '')),
        location: String(r['Location'] ?? '').trim(),
        students,
        profitLoss: Number(r['Profit/Loss']) || 0,
        turnover,
        teacherExpense,
        rent,
        duration: Number(r['Duration of Class']) || 1,
        turnoverPerStudent: tps,
        day: String(r['Day'] ?? '').trim(),
        classTime: Number(r['Classtime']) || 0,
        breakEvenStudents: breakEven,
        profitPerStudent: students > 0 ? (Number(r['Profit/Loss']) || 0) / students : 0,
      };
    });

  // --- Locatie Prestaties sheet ---
  const locRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Locatie Prestaties'], { defval: null });
  const kdLocRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Kosten Locatie'], { defval: null });
  const locCostMap: Record<string, { costPerHour: number; monthlyRent: number | null; lessons: number }> = {};
  kdLocRaw.filter(r => r['Locatie']).forEach(r => {
    locCostMap[String(r['Locatie']).trim()] = {
      costPerHour: Number(r['Kosten / uur']) || 0,
      monthlyRent: r['Locatiehuur per maand'] != null ? Number(r['Locatiehuur per maand']) : null,
      lessons: Number(r['Aantal lessen']) || 0,
    };
  });

  const locations: LocationStat[] = locRaw
    .filter(r => r['Locatie'])
    .map(r => {
      const loc = String(r['Locatie']).trim();
      const cost = locCostMap[loc] ?? { costPerHour: 0, monthlyRent: null, lessons: 0 };
      return {
        location: loc,
        avgProfit: Number(r['Gem. Winst/les']) || 0,
        avgGroupSize: Number(r['Gem. groepsgrootte']) || 0,
        totalRevenue: Number(r['Totale opbrengst']) || 0,
        totalStudents: Number(r['Totaal aantal leerlingen']) || 0,
        ...cost,
      };
    });

  // --- Docenten Prestaties sheet ---
  const dpRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Docenten Prestaties'], { defval: null });
  const kdRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Kosten Docenten'], { defval: null });

  const costMap: Record<string, { hourlyRate: number; travelCost: number }> = {};
  kdRaw.filter(r => r['Docent']).forEach(r => {
    costMap[String(r['Docent']).trim()] = {
      hourlyRate: Number(r['Uurtarief']) || 0,
      travelCost: Number(r['Reiskosten']) || 0,
    };
  });

  const teacherMap: Record<string, TeacherStat> = {};
  dpRaw.filter(r => r['Docent']).forEach(r => {
    const rawName = String(r['Docent']).trim();
    const name = anonymizeTeacher(rawName);
    const totalProfit = Number(r['Totale winst']) || 0;
    const profitPerHour = Number(r['Winst per lesuur']) || 0;
    const hours = profitPerHour !== 0 ? totalProfit / profitPerHour : 0;
    const cost = costMap[rawName] ?? { hourlyRate: 0, travelCost: 0 };
    const totalCost = (cost.hourlyRate * Math.abs(hours)) + cost.travelCost;
    teacherMap[name] = {
      teacher: name,
      totalProfit,
      profitPerHour,
      hours: Math.abs(hours),
      hourlyRate: cost.hourlyRate,
      travelCost: cost.travelCost,
      roi: totalCost > 0 ? totalProfit / totalCost : 0,
    };
  });
  const teachers = Object.values(teacherMap).filter(t => t.hours > 0);

  // --- Day stats ---
  const dayMap: Record<string, { revenue: number; pl: number; students: number; count: number }> = {};
  classes.forEach(c => {
    if (!c.day) return;
    if (!dayMap[c.day]) dayMap[c.day] = { revenue: 0, pl: 0, students: 0, count: 0 };
    dayMap[c.day].revenue += c.turnover;
    dayMap[c.day].pl += c.profitLoss;
    dayMap[c.day].students += c.students;
    dayMap[c.day].count += 1;
  });
  const days: DayStat[] = Object.entries(dayMap)
    .map(([day, d]) => ({
      day,
      totalRevenue: d.revenue,
      totalPL: d.pl,
      avgStudents: d.count > 0 ? d.students / d.count : 0,
      classes: d.count,
      avgPL: d.count > 0 ? d.pl / d.count : 0,
    }))
    .sort((a, b) => (DAY_ORDER[a.day] ?? 9) - (DAY_ORDER[b.day] ?? 9));

  // --- KPI ---
  const totalRevenue = classes.reduce((s, c) => s + c.turnover, 0);
  const netPL = classes.reduce((s, c) => s + c.profitLoss, 0);
  const kpi = {
    totalClasses: classes.length,
    totalRevenue,
    netPL,
    profitableClasses: classes.filter(c => c.profitLoss > 0).length,
    avgStudents: classes.length > 0 ? classes.reduce((s, c) => s + c.students, 0) / classes.length : 0,
    totalTeacherCost: classes.reduce((s, c) => s + c.teacherExpense, 0),
    totalRentCost: classes.reduce((s, c) => s + c.rent, 0),
    dataDate: 'April 2026 (Lesanalyse)',
  };

  return { classes, locations, teachers, days, kpi };
}
