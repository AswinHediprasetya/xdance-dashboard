'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { GraduationCap } from 'lucide-react';
import { useChartPalette } from '@/hooks/useChartPalette';
import type { TeacherStat } from '@/lib/lessonParser';

export function TeacherPerformanceChart({ teachers }: { teachers: TeacherStat[] }) {
  const p = useChartPalette();

  const data = [...teachers]
    .filter(t => t.hours >= 1)
    .sort((a, b) => b.profitPerHour - a.profitPerHour)
    .map(t => ({
      name: t.teacher,
      pph: parseFloat(t.profitPerHour.toFixed(2)),
      total: parseFloat(t.totalProfit.toFixed(2)),
      rate: t.hourlyRate,
      roi: parseFloat(t.roi.toFixed(2)),
    }));

  const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' };

  return (
    <div style={cardStyle}>
      <div className="flex items-center justify-between" style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
        <h3 className="flex items-center gap-2 m-0 text-[13.5px] font-[550]" style={{ color: 'var(--fg-strong)' }}>
          <GraduationCap size={13} />
          Teacher Performance
          <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--fg-faint)' }}>— names anonymised (GDPR)</span>
        </h3>
      </div>
      <div style={{ padding: '16px 22px 20px' }}>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }} barSize={13}>
            <CartesianGrid horizontal={false} strokeDasharray="2 4" stroke={p.hair} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: p.fgFaint }} tickFormatter={v => '€' + v} />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10.5, fill: p.fgFaint }} width={90} />
            <Tooltip
              cursor={{ fill: p.bgSunk }}
              contentStyle={{ background: p.bgElev, border: `1px solid ${p.hair}`, borderRadius: 10, fontSize: 12 }}
              formatter={(v: unknown, name: unknown) => ['€' + Number(v).toFixed(2), name === 'pph' ? 'Profit/hr' : String(name)]}
            />
            <ReferenceLine x={0} stroke={p.hair} strokeWidth={1.5} />
            <Bar dataKey="pph" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.pph >= 0 ? p.accent : '#ef4444'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* ROI table for top/bottom 5 */}
        <div className="mt-4">
          <p className="text-[11.5px] mb-2" style={{ color: 'var(--fg-faint)' }}>
            ROI = profit generated per €1 of teacher cost. Negative = studio loses money on that teacher's classes this period.
          </p>
          <div className="flex flex-col gap-1">
            {data.slice(0, 8).map(t => (
              <div key={t.name} className="flex items-center gap-2 text-[12px] py-1" style={{ borderBottom: '1px dashed var(--border)' }}>
                <span className="font-medium w-24 flex-shrink-0" style={{ color: 'var(--fg-strong)' }}>{t.name}</span>
                <span style={{ color: 'var(--muted-foreground)' }}>€{t.rate}/hr</span>
                <div className="flex-1 h-1.5 rounded-full mx-2" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((t.pph + 50) / 100) * 100))}%`,
                      background: t.pph >= 0 ? '#6366f1' : '#ef4444',
                    }}
                  />
                </div>
                <span className="tabular-nums font-[550]" style={{ color: t.roi >= 0 ? '#22c55e' : '#ef4444' }}>
                  ROI {t.roi >= 0 ? '+' : ''}{t.roi.toFixed(2)}x
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
