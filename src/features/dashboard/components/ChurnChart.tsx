'use client';

import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingDown } from 'lucide-react';
import { useChartPalette } from '@/hooks/useChartPalette';
import type { ChurnDataPoint } from '@/types/metrics';

interface ChurnChartProps {
  data: ChurnDataPoint[];
  churnRate: number;
  retentionRate: number;
}

export function ChurnChart({ data, churnRate, retentionRate }: ChurnChartProps) {
  const p = useChartPalette();

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
          <TrendingDown style={{ width: 13, height: 13 }} />
          Member flow
        </h3>
        <span
          className="tabular-nums"
          style={{ fontSize: 12, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}
        >
          Retention {(retentionRate * 100).toFixed(1)}%
        </span>
      </div>

      <div style={{ padding: '20px 22px 22px' }}>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.accent} stopOpacity={0.3} />
                <stop offset="100%" stopColor={p.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="2 4" stroke={p.hair} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: p.fgFaint }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: p.fgFaint }}
              width={28}
            />
            <Tooltip
              cursor={{ stroke: p.hair, strokeDasharray: '3 3' }}
              contentStyle={{
                background: p.bgElev,
                border: `1px solid ${p.hair}`,
                borderRadius: 10,
                padding: '8px 10px',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="net"
              name="Net"
              stroke={p.accent}
              strokeWidth={2}
              fill="url(#netGrad)"
              dot={false}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="newMembers"
              name="New"
              stroke={p.fgStrong}
              strokeWidth={1.5}
              dot={{ r: 2.5, fill: p.fgStrong }}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="churned"
              name="Churned"
              stroke={p.fgFaint}
              strokeWidth={1.25}
              strokeDasharray="3 3"
              dot={{ r: 2, fill: p.fgFaint }}
              animationDuration={800}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex gap-4 mt-3.5 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
          <span className="flex items-center gap-1.5">
            <span className="rounded-sm" style={{ width: 10, height: 10, background: p.accent }} />
            Net
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 2, background: p.fgStrong }} />
            New
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 0, borderTop: `1.5px dashed ${p.fgFaint}` }} />
            Churned
          </span>
        </div>
      </div>
    </div>
  );
}
