'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';
import { useChartPalette } from '@/hooks/useChartPalette';
import type { RevenueByType } from '@/types/metrics';

interface RevenueChartProps {
  data: RevenueByType[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const p = useChartPalette();
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const hasRevenue = total > 0;

  const colors = [
    p.accent,
    p.accentLite,
    p.accentLiter,
    p.accentMuted,
    p.mix(p.fgFaint, '#ffffff', 0.4),
  ];

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
          <DollarSign style={{ width: 13, height: 13 }} />
          Revenue by membership
        </h3>
        <span
          className="tabular-nums"
          style={{ fontSize: 12, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}
        >
          €{Math.round(total).toLocaleString()} · last 30d
        </span>
      </div>

      <div style={{ padding: '20px 22px 22px' }}>
        {!hasRevenue ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-[13px]" style={{ color: 'var(--fg-faint)' }}>No fee data available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 28, alignItems: 'center' }}>
            {/* Donut */}
            <div style={{ position: 'relative', width: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="revenue"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={2}
                    stroke={p.bgElev}
                    strokeWidth={2}
                    animationDuration={800}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: p.bgElev,
                      border: `1px solid ${p.hair}`,
                      borderRadius: 10,
                      padding: '8px 10px',
                      fontSize: 12,
                    }}
                    formatter={(v) => ['€' + Math.round(Number(v)).toLocaleString()]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  pointerEvents: 'none',
                }}
              >
                <div
                  className="tabular-nums"
                  style={{ fontSize: 22, fontWeight: 550, letterSpacing: '-0.03em', color: 'var(--fg-strong)' }}
                >
                  €{(total >= 1000 ? (total / 1000).toFixed(0) + 'k' : Math.round(total).toString())}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--fg-faint)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Monthly
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2.5 min-w-0">
              {data.map((d, i) => {
                const pct = total > 0 ? (d.revenue / total * 100) : 0;
                return (
                  <div
                    key={d.type}
                    style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto auto', gap: 10, alignItems: 'center' }}
                    className="text-[13px]"
                  >
                    <span className="rounded-sm" style={{ width: 10, height: 10, background: colors[i % colors.length] }} />
                    <span className="font-medium truncate" style={{ color: 'var(--fg-strong)', letterSpacing: '-0.005em' }}>
                      {d.type}
                    </span>
                    <span
                      className="tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-foreground)' }}
                    >
                      €{Math.round(d.revenue).toLocaleString()}
                    </span>
                    <span
                      className="tabular-nums text-right"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-faint)', minWidth: 40 }}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
