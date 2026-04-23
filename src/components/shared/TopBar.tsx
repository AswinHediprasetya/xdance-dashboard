'use client';

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const PERIODS = ['7d', '30d', '90d', '1y'] as const;
type Period = typeof PERIODS[number];

export function TopBar() {
  const [period, setPeriod] = useState<Period>('30d');

  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-3.5 px-10 py-3.5"
      style={{
        backdropFilter: 'saturate(180%) blur(18px)',
        WebkitBackdropFilter: 'saturate(180%) blur(18px)',
        background: 'color-mix(in oklab, var(--background) 72%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Breadcrumb */}
      <div className="text-[13px]" style={{ color: 'var(--muted-foreground)', letterSpacing: '-0.005em' }}>
        Workspace{' '}
        <span style={{ margin: '0 5px', opacity: 0.4 }}>›</span>
        <strong style={{ color: 'var(--fg-strong)', fontWeight: 550 }}>Dashboard</strong>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div
        className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-[13px] rounded-[10px]"
        style={{
          border: '1px solid var(--border)',
          background: 'var(--card)',
          minWidth: 220,
          color: 'var(--muted-foreground)',
          boxShadow: '0 1px 0 rgba(15,17,33,.04)',
        }}
      >
        <Search style={{ width: 14, height: 14, flexShrink: 0 }} />
        <span className="flex-1" style={{ color: 'var(--fg-faint)' }}>Search members, classes…</span>
        <span
          className="text-[10.5px] px-1 py-0.5 rounded"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--fg-faint)',
            border: '1px solid var(--border)',
            background: 'var(--muted)',
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Period segmented control */}
      <div
        className="flex p-[3px] gap-0.5 rounded-[9px]"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="text-[12.5px] font-medium rounded-[6px] px-2.5 py-[5px] transition-all duration-150 cursor-pointer"
            style={{
              border: 'none',
              background: period === p ? 'var(--card)' : 'transparent',
              color: period === p ? 'var(--fg-strong)' : 'var(--muted-foreground)',
              boxShadow: period === p ? '0 1px 2px rgba(15,17,33,.04),0 0 0 .5px rgba(15,17,33,.05)' : 'none',
              letterSpacing: '-0.005em',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <ThemeToggle />

      <button
        className="flex items-center justify-center rounded-[7px] transition-colors duration-150 cursor-pointer"
        style={{
          width: 28, height: 28,
          background: 'transparent', border: 'none',
          color: 'var(--muted-foreground)',
        }}
        title="Notifications"
      >
        <Bell style={{ width: 15, height: 15 }} />
      </button>
    </div>
  );
}
