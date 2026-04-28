'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapPin } from 'lucide-react';
import { useChartPalette } from '@/hooks/useChartPalette';
import type { LocationStat } from '@/lib/lessonParser';

export function LocationPerformanceChart({ locations }: { locations: LocationStat[] }) {
  const p = useChartPalette();
  const data = [...locations]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map(l => ({
      name: l.location,
      Revenue: parseFloat(l.totalRevenue.toFixed(0)),
      Profit: parseFloat((l.avgProfit * l.lessons).toFixed(0)),
      'Avg group': parseFloat(l.avgGroupSize.toFixed(1)),
    }));

  const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' };

  return (
    <div style={cardStyle}>
      <div className="flex items-center justify-between" style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
        <h3 className="flex items-center gap-2 m-0 text-[13.5px] font-[550]" style={{ color: 'var(--fg-strong)' }}>
          <MapPin size={13} />
          Location Performance
        </h3>
        <span className="text-[12px]" style={{ color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}>
          {locations.length} venues
        </span>
      </div>
      <div style={{ padding: '16px 22px 20px' }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} strokeDasharray="2 4" stroke={p.hair} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: p.fgFaint }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: p.fgFaint }} tickFormatter={v => '€' + v} width={46} />
            <Tooltip
              cursor={{ fill: p.bgSunk }}
              contentStyle={{ background: p.bgElev, border: `1px solid ${p.hair}`, borderRadius: 10, fontSize: 12 }}
              formatter={(v: unknown) => ['€' + Number(v).toLocaleString()]}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: p.fgFaint }} />
            <Bar dataKey="Revenue" fill={p.accent} fillOpacity={0.9} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Profit" fill={p.accentLite} fillOpacity={0.85} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Location detail table */}
        <div className="mt-4 flex flex-col gap-1">
          {[...locations].sort((a, b) => b.avgProfit - a.avgProfit).map(l => (
            <div key={l.location} className="flex items-center gap-3 text-[12px] py-1.5" style={{ borderBottom: '1px dashed var(--border)' }}>
              <span className="font-medium w-28 flex-shrink-0" style={{ color: 'var(--fg-strong)' }}>{l.location}</span>
              <span style={{ color: 'var(--muted-foreground)' }}>Avg profit/class:</span>
              <span className="font-[550] tabular-nums" style={{ color: l.avgProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                €{l.avgProfit.toFixed(2)}
              </span>
              <span className="ml-auto" style={{ color: 'var(--fg-faint)' }}>~{l.avgGroupSize.toFixed(0)} students · {l.lessons} classes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
