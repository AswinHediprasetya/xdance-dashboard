'use client';

import { Users } from 'lucide-react';
import type { MembershipTypeDistribution } from '@/types/metrics';

interface MembershipChartProps {
  data: MembershipTypeDistribution[];
}

export function MembershipChart({ data }: MembershipChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

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
          <Users style={{ width: 13, height: 13 }} />
          Membership mix
        </h3>
        <span
          className="tabular-nums"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-faint)' }}
        >
          {total.toLocaleString()} members
        </span>
      </div>

      <div style={{ padding: '20px 22px 22px' }}>
        {data.map((m, i) => (
          <div
            key={m.type}
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr 52px 44px',
              gap: 14,
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: 13,
            }}
          >
            <span
              className="font-medium"
              style={{ color: 'var(--fg-strong)', letterSpacing: '-0.005em' }}
            >
              {m.type}
            </span>
            <div style={{ height: 4, background: 'var(--muted)', borderRadius: 10, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: m.percentage + '%',
                  background: `color-mix(in oklab, var(--primary) ${100 - i * 15}%, var(--fg-faint))`,
                  borderRadius: 10,
                  transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                }}
              />
            </div>
            <span
              className="tabular-nums text-right"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-foreground)' }}
            >
              {m.count}
            </span>
            <span
              className="tabular-nums text-right"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-faint)' }}
            >
              {m.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
