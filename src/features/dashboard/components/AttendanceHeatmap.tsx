'use client';

import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useChartPalette } from '@/hooks/useChartPalette';
import type { AttendanceByDay } from '@/types/metrics';

interface AttendanceHeatmapProps {
  data: AttendanceByDay[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

// Distribution of check-ins across hours (sum = 1)
const HOUR_WEIGHTS = [0.04, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.12, 0.14, 0.12, 0.09];
// Weekend midday boost multipliers per hour index
const WEEKEND_MULT = [0.5, 0.5, 0.7, 1.0, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6, 0.5];

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.replace('#', ''), 16);
  const pb = parseInt(b.replace('#', ''), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return '#' + [r, g, bl].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  const p = useChartPalette();

  // Map day names from data to Mon-Sun (normalize)
  const dayMap = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach(d => {
      const key = d.day.slice(0, 3);
      m[key] = d.checkIns;
    });
    return m;
  }, [data]);

  const maxVal = useMemo(() => {
    let max = 0;
    DAYS.forEach((day, di) => {
      const dayTotal = dayMap[day] ?? 0;
      HOURS.forEach((_, hi) => {
        const isWeekend = di >= 5;
        const wt = isWeekend ? HOUR_WEIGHTS[hi] * WEEKEND_MULT[hi] : HOUR_WEIGHTS[hi];
        const v = Math.round(dayTotal * wt);
        if (v > max) max = v;
      });
    });
    return Math.max(max, 1);
  }, [dayMap]);

  const cellValue = (dayIdx: number, hourIdx: number): number => {
    const day = DAYS[dayIdx];
    const dayTotal = dayMap[day] ?? 0;
    const isWeekend = dayIdx >= 5;
    const wt = isWeekend ? HOUR_WEIGHTS[hourIdx] * WEEKEND_MULT[hourIdx] : HOUR_WEIGHTS[hourIdx];
    return Math.round(dayTotal * wt);
  };

  const shade = (v: number) => {
    const t = v / maxVal;
    return mix(p.bgSunk, p.accent, 0.08 + t * 0.92);
  };

  const peakDay = data.reduce((best, d) => d.checkIns > best.checkIns ? d : best, data[0] ?? { day: '—', checkIns: 0 });

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: '0 1px 0 rgba(15,17,33,.04)',
    overflow: 'hidden',
  };

  return (
    <div style={cardStyle}>
      <div
        className="flex items-center justify-between"
        style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}
      >
        <h3
          className="flex items-center gap-2 m-0"
          style={{ fontSize: 13.5, fontWeight: 550, letterSpacing: '-0.005em', color: 'var(--fg-strong)' }}
        >
          <Calendar style={{ width: 13, height: 13 }} />
          Attendance heatmap
        </h3>
        <span style={{ fontSize: 12, color: 'var(--fg-faint)' }}>
          Peak: {peakDay?.day ?? '—'}
        </span>
      </div>

      <div style={{ padding: '20px 22px 22px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Hour labels */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-faint)',
              paddingTop: 18, paddingBottom: 2,
            }}
          >
            <span>8a</span>
            <span>12p</span>
            <span>4p</span>
            <span>8p</span>
          </div>

          {/* Grid */}
          <div style={{ flex: 1 }}>
            {/* Day labels */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: `repeat(${DAYS.length}, 1fr)`,
                fontSize: 10.5, color: 'var(--fg-faint)', textAlign: 'center', marginBottom: 6,
              }}
            >
              {DAYS.map(d => <span key={d}>{d}</span>)}
            </div>

            {/* Cells: columns = days, rows = hours */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${DAYS.length}, 1fr)`,
                gap: 3,
              }}
            >
              {DAYS.map((day, di) => (
                <div key={day} style={{ display: 'grid', gridAutoRows: '1fr', gap: 3 }}>
                  {HOURS.map((hour, hi) => {
                    const v = cellValue(di, hi);
                    return (
                      <div
                        key={hour}
                        title={`${day} ${hour}:00 — ${v} check-ins`}
                        style={{
                          aspectRatio: '1',
                          borderRadius: 4,
                          background: shade(v),
                          cursor: 'default',
                          transition: 'transform .1s ease',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.15)';
                          (e.currentTarget as HTMLDivElement).style.zIndex = '3';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = '';
                          (e.currentTarget as HTMLDivElement).style.zIndex = '';
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-2 mt-3 justify-end"
          style={{ fontSize: 11, color: 'var(--fg-faint)' }}
        >
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.55, 0.8, 1].map((t, i) => (
              <div key={i} style={{ width: 14, height: 12, borderRadius: 3, background: mix(p.bgSunk, p.accent, t) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
