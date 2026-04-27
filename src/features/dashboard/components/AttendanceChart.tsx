'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';
import { useChartPalette } from '@/hooks/useChartPalette';
import type { AttendanceByStyle } from '@/types/metrics';

interface AttendanceChartProps {
  data: AttendanceByStyle[];
}

function compactNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const [focus, setFocus] = useState<string | null>(null);
  const p = useChartPalette();
  // Rename 'style' → 'name' to avoid React treating it as a DOM style prop inside Recharts
  const chartData = (focus ? data.filter(d => d.style === focus) : data.slice(0, 8))
    .map(d => ({ name: d.style, checkIns: d.checkIns }));
  const total = data.reduce((s, d) => s + d.checkIns, 0);

  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: '0 1px 0 rgba(15,17,33,.04)',
    overflow: 'hidden',
  };

  return (
    <div style={cardStyle}>
      {/* Head */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}
      >
        <h3
          className="flex items-center gap-2 m-0"
          style={{ fontSize: 13.5, fontWeight: 550, letterSpacing: '-0.005em', color: 'var(--fg-strong)' }}
        >
          <Activity style={{ width: 13, height: 13 }} />
          Attendance by style
        </h3>
        <span
          className="tabular-nums"
          style={{ fontSize: 12, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}
        >
          {total.toLocaleString()} check-ins
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 22px 22px' }}>
        {/* Filter pills */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <button
            onClick={() => setFocus(null)}
            className="text-[12px] font-medium px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer"
            style={{
              border: '1px solid var(--border)',
              background: focus == null ? '#111' : 'var(--card)',
              color: focus == null ? 'white' : 'var(--muted-foreground)',
            }}
          >
            All
          </button>
          {data.slice(0, 5).map(s => (
            <button
              key={s.style}
              onClick={() => setFocus(focus === s.style ? null : s.style)}
              className="text-[12px] font-medium px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer"
              style={{
                border: '1px solid var(--border)',
                background: focus === s.style ? '#111' : 'var(--card)',
                color: focus === s.style ? 'white' : 'var(--muted-foreground)',
              }}
            >
              {s.style}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="24%">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.accent} stopOpacity={1} />
                <stop offset="100%" stopColor={p.accent} stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="2 4" stroke={p.hair} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: p.fgFaint }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: p.fgFaint }}
              tickFormatter={compactNum}
              width={34}
            />
            <Tooltip
              cursor={{ fill: p.bgSunk }}
              contentStyle={{
                background: p.bgElev,
                border: `1px solid ${p.hair}`,
                borderRadius: 10,
                padding: '8px 10px',
                boxShadow: '0 1px 2px rgba(15,17,33,.04)',
                fontSize: 12,
              }}
              formatter={(v) => [String(v) + ' check-ins']}
            />
            <Bar dataKey="checkIns" fill="url(#barGrad)" radius={[6, 6, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
