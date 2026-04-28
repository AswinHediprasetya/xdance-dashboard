'use client';

import { TrendingUp, Users, Euro, AlertTriangle } from 'lucide-react';
import type { LessonSummary } from '@/lib/lessonParser';

function fmt(n: number) {
  return '€' + Math.round(n).toLocaleString('nl-NL');
}

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string;
}) {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-xl"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
        <span
          className="flex items-center justify-center rounded-lg"
          style={{ width: 28, height: 28, background: color + '18', color }}
        >
          <Icon size={13} />
        </span>
      </div>
      <div>
        <div className="text-[28px] font-[650] tracking-[-0.03em] leading-none" style={{ color: 'var(--fg-strong)' }}>
          {value}
        </div>
        <div className="text-[12px] mt-1.5" style={{ color: 'var(--fg-faint)' }}>{sub}</div>
      </div>
    </div>
  );
}

export function LessonKpiStrip({ kpi }: { kpi: LessonSummary['kpi'] }) {
  const lossCount = kpi.totalClasses - kpi.profitableClasses;
  const profitPct = ((kpi.profitableClasses / kpi.totalClasses) * 100).toFixed(0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={Euro}
        label="Total Revenue"
        value={fmt(kpi.totalRevenue)}
        sub={`Net profit: ${fmt(kpi.netPL)}`}
        color="#6366f1"
      />
      <KpiCard
        icon={TrendingUp}
        label="Net Profit Margin"
        value={((kpi.netPL / kpi.totalRevenue) * 100).toFixed(1) + '%'}
        sub={`${fmt(kpi.netPL)} of ${fmt(kpi.totalRevenue)} revenue`}
        color="#22c55e"
      />
      <KpiCard
        icon={Users}
        label="Profitable Classes"
        value={`${kpi.profitableClasses}/${kpi.totalClasses}`}
        sub={`${profitPct}% generating profit`}
        color="#a855f7"
      />
      <KpiCard
        icon={AlertTriangle}
        label="Loss-making Classes"
        value={String(lossCount)}
        sub={`Avg ${Math.round(kpi.avgStudents)} students/class`}
        color={lossCount > 10 ? '#ef4444' : '#f59e0b'}
      />
    </div>
  );
}
