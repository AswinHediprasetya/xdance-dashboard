'use client';

import { useMemo } from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
  ResponsiveContainer as RechartsResponsiveContainer,
} from 'recharts';
import { Users as UsersIcon } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { useChartPalette } from '@/hooks/useChartPalette';
import { Delta } from '@/components/shared/Delta';
import type { KpiMetrics, ChurnDataPoint } from '@/types/metrics';

interface FeaturedKpiProps {
  kpis: KpiMetrics;
  churnData: ChurnDataPoint[];
}

export function FeaturedKpi({ kpis, churnData }: FeaturedKpiProps) {
  const count = useCountUp(kpis.totalActiveMembers);
  const p = useChartPalette();

  const sparkData = useMemo(() => {
    if (!churnData.length) return [{ v: kpis.totalActiveMembers }];
    let running = kpis.totalActiveMembers;
    const reversed = [...churnData].reverse().map(d => {
      running = running - d.net;
      return running;
    });
    return [...reversed.reverse(), kpis.totalActiveMembers].map(v => ({ v }));
  }, [churnData, kpis.totalActiveMembers]);

  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const retentionPct = (kpis.retentionRate * 100).toFixed(1);

  return (
    <div
      className="rounded-[var(--radius)] relative overflow-hidden"
      style={{
        padding: 28,
        background: `radial-gradient(circle at 95% -10%, var(--accent-glow) 0%, transparent 50%), var(--card)`,
        border: '1px solid var(--border)',
        boxShadow: '0 1px 0 rgba(15,17,33,.04)',
      }}
    >
      {/* Label row */}
      <div
        className="flex items-center gap-2 text-[12.5px] font-medium"
        style={{ color: 'var(--muted-foreground)', letterSpacing: '-0.005em' }}
      >
        <UsersIcon style={{ width: 13, height: 13 }} />
        Active members
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-medium"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}
        >
          +{kpis.newMembersThisPeriod} this period
        </span>
      </div>

      {/* Big number */}
      <div
        className="tabular-nums leading-none"
        style={{
          fontSize: 84, fontWeight: 500, letterSpacing: '-0.045em',
          color: 'var(--fg-strong)', margin: '18px 0 6px',
          fontFeatureSettings: '"ss01"',
        }}
      >
        {count.toLocaleString()}
      </div>

      {/* Delta + period */}
      <div className="flex items-center gap-2.5 mb-3">
        <Delta value={3.1} unit="%" />
        <span className="text-[12px]" style={{ color: 'var(--fg-faint)' }}>vs. last 30 days</span>
      </div>

      {/* Caption */}
      <div
        className="text-[13.5px] leading-relaxed"
        style={{ color: 'var(--muted-foreground)', maxWidth: 320, letterSpacing: '-0.005em' }}
      >
        {greet}, Hani. {retentionPct}% retention — the studio is growing steadily.
      </div>

      {/* Sparkline */}
      <div style={{ marginTop: 20, height: 72 }}>
        <RechartsResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={p.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <RechartsArea
              type="monotone"
              dataKey="v"
              stroke={p.accent}
              strokeWidth={2}
              fill="url(#heroGrad)"
              dot={false}
              activeDot={{ r: 4, fill: p.accent, stroke: p.bgElev, strokeWidth: 2 }}
              isAnimationActive
              animationDuration={900}
            />
          </RechartsAreaChart>
        </RechartsResponsiveContainer>
      </div>
    </div>
  );
}
