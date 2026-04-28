'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import type { LessonClass } from '@/lib/lessonParser';

export function BreakEvenTable({ classes }: { classes: LessonClass[] }) {
  const losing = classes
    .filter(c => c.profitLoss < 0)
    .sort((a, b) => a.profitLoss - b.profitLoss)
    .slice(0, 12);

  const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' };

  return (
    <div style={cardStyle}>
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <AlertCircle size={13} style={{ color: '#ef4444' }} />
          <h3 className="m-0 text-[13.5px] font-[550]" style={{ color: 'var(--fg-strong)' }}>
            Break-even Analysis — Loss-making Classes
          </h3>
        </div>
        <p className="text-[12px] mt-1 m-0" style={{ color: 'var(--fg-faint)' }}>
          Shows how many more students each class needs to become profitable.
        </p>
      </div>
      <div style={{ padding: '12px 22px 20px' }}>
        {/* Header */}
        <div
          className="grid text-[11px] font-medium pb-2 mb-1"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr', color: 'var(--fg-faint)', borderBottom: '1px solid var(--border)' }}
        >
          <span>Class</span>
          <span className="text-right">Students</span>
          <span className="text-right">Need</span>
          <span className="text-right">Gap</span>
          <span className="text-right">Loss</span>
        </div>
        {losing.map((c, i) => {
          const gap = Math.max(0, c.breakEvenStudents - c.students);
          const pct = c.breakEvenStudents > 0 ? (c.students / c.breakEvenStudents) * 100 : 0;
          return (
            <div
              key={i}
              className="grid items-center py-2 text-[12.5px]"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr', borderBottom: '1px dashed var(--border)' }}
            >
              <div className="min-w-0 pr-3">
                <div className="truncate font-medium" style={{ color: 'var(--fg-strong)' }}>{c.className}</div>
                <div className="text-[11px]" style={{ color: 'var(--fg-faint)' }}>{c.teacher} · {c.location}</div>
                <div className="mt-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, pct)}%`, background: pct >= 75 ? '#f59e0b' : '#ef4444' }}
                  />
                </div>
              </div>
              <span className="text-right tabular-nums" style={{ color: 'var(--fg-strong)' }}>{c.students}</span>
              <span className="text-right tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{c.breakEvenStudents}</span>
              <span className="text-right tabular-nums font-medium" style={{ color: gap > 5 ? '#ef4444' : '#f59e0b' }}>
                +{gap}
              </span>
              <span className="text-right tabular-nums font-medium" style={{ color: '#ef4444' }}>
                €{Math.abs(c.profitLoss).toFixed(2)}
              </span>
            </div>
          );
        })}
        {losing.length === 0 && (
          <div className="flex items-center gap-2 py-6 justify-center">
            <CheckCircle size={14} style={{ color: '#22c55e' }} />
            <span className="text-[13px]" style={{ color: 'var(--fg-faint)' }}>All classes are profitable!</span>
          </div>
        )}
      </div>
    </div>
  );
}
