'use client';

import { Star } from 'lucide-react';
import type { AttendanceByClass } from '@/types/metrics';

interface ClassPerformanceProps {
  data: AttendanceByClass[];
}

export function ClassPerformance({ data }: ClassPerformanceProps) {
  const max = Math.max(...data.map(d => d.checkIns), 1);

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
          <Star style={{ width: 13, height: 13 }} />
          Top performing classes
        </h3>
        <span style={{ fontSize: 12, color: 'var(--fg-faint)' }}>Last 30 days</span>
      </div>

      <div style={{ padding: '4px 22px 8px' }}>
        {data.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: 'var(--fg-faint)' }}>
            No class data available
          </p>
        ) : (
          data.map((cls, i) => (
            <div
              key={i}
              className="transition-all duration-150 cursor-default"
              style={{
                display: 'grid',
                gridTemplateColumns: '20px 1fr auto',
                alignItems: 'center',
                gap: 14,
                padding: '14px 0',
                borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.paddingLeft = '4px'; }}
              onMouseLeave={e => { e.currentTarget.style.paddingLeft = '0'; }}
            >
              <span
                className="tabular-nums"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-faint)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div
                  className="text-[13.5px] font-medium"
                  style={{ color: 'var(--fg-strong)', letterSpacing: '-0.005em' }}
                >
                  {cls.className}
                </div>
                <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--fg-faint)' }}>
                  {cls.uniqueMembers} members
                </div>
              </div>
              <div className="flex flex-col items-end gap-1" style={{ minWidth: 120 }}>
                <span
                  className="tabular-nums font-medium"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--fg-strong)' }}
                >
                  {cls.checkIns.toLocaleString()}
                </span>
                <div style={{ width: 120, height: 4, background: 'var(--muted)', borderRadius: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(cls.checkIns / max) * 100}%`,
                      background: 'linear-gradient(90deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 70%, white) 100%)',
                      borderRadius: 10,
                      transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
