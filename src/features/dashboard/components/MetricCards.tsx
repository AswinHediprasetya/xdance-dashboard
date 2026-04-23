'use client';

import { UserPlus, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Delta } from '@/components/shared/Delta';
import type { KpiMetrics } from '@/types/metrics';

interface MetricCardsProps {
  kpis: KpiMetrics;
}

const cardStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: '0 1px 0 rgba(15,17,33,.04)',
  overflow: 'hidden',
};

export function MetricCards({ kpis }: MetricCardsProps) {
  const items = [
    {
      label: 'New this period',
      icon: UserPlus,
      value: kpis.newMembersThisPeriod.toLocaleString(),
      delta: null as number | null,
      sub: 'joined',
      invertColor: false,
    },
    {
      label: 'Churn rate',
      icon: TrendingDown,
      value: (kpis.churnRate * 100).toFixed(2) + '%',
      delta: null as number | null,
      sub: `${kpis.churnedThisPeriod} cancelled`,
      invertColor: true,
    },
    {
      label: 'Avg revenue / mbr',
      icon: DollarSign,
      value: kpis.averageRevenuePerMember != null
        ? '€' + Math.round(kpis.averageRevenuePerMember).toLocaleString()
        : 'N/A',
      delta: null as number | null,
      sub: kpis.totalRevenue != null
        ? '€' + Math.round(kpis.totalRevenue).toLocaleString() + ' total'
        : 'No fee data',
      invertColor: false,
    },
    {
      label: 'Total check-ins',
      icon: Activity,
      value: kpis.totalCheckIns.toLocaleString(),
      delta: null as number | null,
      sub: 'across classes',
      invertColor: false,
    },
  ];

  return (
    <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex flex-col gap-2 transition-colors duration-200"
            style={{
              padding: '22px 24px',
              borderRight: i < items.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div
              className="flex items-center gap-[7px] text-[12.5px] font-medium"
              style={{ color: 'var(--muted-foreground)', letterSpacing: '-0.005em' }}
            >
              <Icon style={{ width: 13, height: 13, color: 'var(--fg-faint)' }} />
              {item.label}
            </div>
            <div
              className="tabular-nums leading-none"
              style={{ fontSize: 30, fontWeight: 550, letterSpacing: '-0.03em', color: 'var(--fg-strong)' }}
            >
              {item.value}
            </div>
            <div
              className="flex items-center gap-2.5 text-[12px]"
              style={{ color: 'var(--fg-faint)', letterSpacing: '-0.005em' }}
            >
              {item.delta != null && (
                <Delta value={item.delta} unit="%" invertColor={item.invertColor} />
              )}
              <span style={{ opacity: 0.7 }}>{item.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
