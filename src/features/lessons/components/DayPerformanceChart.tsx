'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar } from 'lucide-react';
import { useChartPalette } from '@/hooks/useChartPalette';
import type { DayStat } from '@/lib/lessonParser';

export function DayPerformanceChart({ days }: { days: DayStat[] }) {
  const p = useChartPalette();

  const maxRevenue = Math.max(...days.map(d => d.totalRevenue), 1);

  const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' };

  return (
    <div style={cardStyle}>
      <div className="flex items-center justify-between" style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
        <h3 className="flex items-center gap-2 m-0 text-[13.5px] font-[550]" style={{ color: 'var(--fg-strong)' }}>
          <Calendar size={13} />
          Performance by Day
        </h3>
        <span className="text-[12px]" style={{ color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}>
          avg profit/class
        </span>
      </div>
      <div style={{ padding: '16px 22px 20px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={days} margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} strokeDasharray="2 4" stroke={p.hair} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: p.fgFaint }}
              tickFormatter={d => d.slice(0, 3)} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: p.fgFaint }} tickFormatter={v => '€' + v} width={40} />
            <Tooltip
              cursor={{ fill: p.bgSunk }}
              contentStyle={{ background: p.bgElev, border: `1px solid ${p.hair}`, borderRadius: 10, fontSize: 12 }}
              formatter={(v: unknown) => ['€' + Number(v).toFixed(2), 'Avg P/L']}
            />
            <Bar dataKey="avgPL" radius={[4, 4, 0, 0]}>
              {days.map((d, i) => (
                <Cell key={i} fill={d.avgPL >= 0 ? p.accent : '#ef4444'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {days.map(d => (
            <div key={d.day} className="rounded-lg p-3" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
              <div className="text-[11px] font-medium" style={{ color: 'var(--fg-faint)' }}>{d.day}</div>
              <div className="text-[16px] font-[650] mt-0.5" style={{ color: 'var(--fg-strong)' }}>€{Math.round(d.totalRevenue)}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--fg-faint)' }}>
                {d.classes} classes · ~{d.avgStudents.toFixed(0)} students
              </div>
              <div
                className="text-[11.5px] font-medium mt-1"
                style={{ color: d.avgPL >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {d.avgPL >= 0 ? '+' : ''}€{d.avgPL.toFixed(2)}/class
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
