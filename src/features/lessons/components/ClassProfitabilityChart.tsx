'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { useChartPalette } from '@/hooks/useChartPalette';
import type { LessonClass } from '@/lib/lessonParser';

function shorten(name: string) {
  return name.length > 28 ? name.slice(0, 26) + '…' : name;
}

export function ClassProfitabilityChart({ classes }: { classes: LessonClass[] }) {
  const [view, setView] = useState<'worst' | 'best'>('worst');
  const p = useChartPalette();

  const sorted = [...classes].sort((a, b) => a.profitLoss - b.profitLoss);
  const data = (view === 'worst' ? sorted.slice(0, 15) : sorted.slice(-15).reverse())
    .map(c => ({ name: shorten(c.className), pl: parseFloat(c.profitLoss.toFixed(2)), teacher: c.teacher, loc: c.location, students: c.students }));

  const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' };

  return (
    <div style={cardStyle}>
      <div className="flex items-center justify-between" style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
        <h3 className="flex items-center gap-2 m-0 text-[13.5px] font-[550]" style={{ color: 'var(--fg-strong)' }}>
          <TrendingDown size={13} />
          Class Profitability
        </h3>
        <div className="flex gap-1">
          {(['worst', 'best'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="text-[11.5px] font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer"
              style={{
                border: '1px solid var(--border)',
                background: view === v ? '#111' : 'var(--card)',
                color: view === v ? 'white' : 'var(--muted-foreground)',
              }}
            >
              {v === 'worst' ? 'Losing' : 'Winning'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 22px 20px' }}>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barSize={14}>
            <CartesianGrid horizontal={false} strokeDasharray="2 4" stroke={p.hair} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: p.fgFaint }}
              tickFormatter={v => '€' + v}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10.5, fill: p.fgFaint }}
              width={160}
            />
            <Tooltip
              cursor={{ fill: p.bgSunk }}
              contentStyle={{ background: p.bgElev, border: `1px solid ${p.hair}`, borderRadius: 10, fontSize: 12 }}
              formatter={(v: unknown) => ['€' + Number(v).toFixed(2), 'P/L']}
            />
            <ReferenceLine x={0} stroke={p.hair} strokeWidth={1.5} />
            <Bar dataKey="pl" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.pl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
