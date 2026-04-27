'use client';

import { useMemo } from 'react';
import type { CanonicalMember } from '@/types/member';

interface ActivityFeedProps {
  members: CanonicalMember[];
}

type ActivityKind = 'join' | 'upgrade' | 'churn' | 'checkin';

const DOT_COLOR: Record<ActivityKind, string> = {
  join: 'var(--pos)',
  upgrade: 'var(--primary)',
  churn: 'var(--neg)',
  checkin: 'var(--fg-faint)',
};

const KIND_LABEL: Record<ActivityKind, string> = {
  join: 'Joined',
  upgrade: 'Upgraded',
  churn: 'Cancelled',
  checkin: 'Checked in',
};

function anonymizeName(first: string, last: string): string {
  const f = first?.trim() || '';
  const l = last?.trim() || '';
  if (!f && !l) return 'Anonymous';
  const lastInitial = l ? ` ${l[0].toUpperCase()}.` : '';
  return `${f}${lastInitial}`;
}

function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export function ActivityFeed({ members }: ActivityFeedProps) {
  const activities = useMemo(() => {
    const sorted = [...members]
      .filter(m => m.startDate)
      .sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));

    return sorted.slice(0, 6).map(m => {
      let kind: ActivityKind = 'join';
      let meta = `${m.membershipType}`;
      if (m.danceStyle) meta += ` · ${m.danceStyle}`;

      if (m.membershipStatus === 'Inactief' || m.membershipStatus === 'inactive') {
        kind = 'churn';
        meta = `Cancelled · ${m.membershipType}`;
      } else if (
        m.membershipType?.toLowerCase().includes('annual') ||
        m.membershipType?.toLowerCase().includes('jaar')
      ) {
        kind = 'upgrade';
        meta = `Upgraded to ${m.membershipType}`;
      } else if (m.totalCheckIns && m.totalCheckIns > 20) {
        kind = 'checkin';
        meta = m.danceStyle ?? m.membershipType ?? '';
      }

      return {
        kind,
        who: anonymizeName(m.firstName, m.lastName),
        meta,
        date: m.startDate,
      };
    });
  }, [members]);

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-[13px]" style={{ color: 'var(--fg-faint)' }}>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {activities.map((a, i) => (
        <div
          key={i}
          className="flex items-center gap-3 text-[13px] py-2.5"
          style={{
            borderBottom: i < activities.length - 1 ? '1px dashed var(--border)' : 'none',
          }}
        >
          <span
            className="flex-shrink-0 rounded-full"
            style={{ width: 6, height: 6, background: DOT_COLOR[a.kind] }}
          />
          <span className="font-medium truncate min-w-0" style={{ color: 'var(--fg-strong)' }}>
            {a.who}
          </span>
          <span
            className="flex-1 truncate min-w-0 text-[12.5px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            — {a.meta}
          </span>
          <span
            className="flex-shrink-0 text-[11.5px] tabular-nums"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-faint)' }}
          >
            {formatShortDate(a.date)}
          </span>
        </div>
      ))}
    </div>
  );
}
