'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { FeaturedKpi } from '@/features/dashboard/components/FeaturedKpi';
import { MetricCards } from '@/features/dashboard/components/MetricCards';
import { MembershipChart } from '@/features/dashboard/components/MembershipChart';
import { AttendanceChart } from '@/features/dashboard/components/AttendanceChart';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { ChurnChart } from '@/features/dashboard/components/ChurnChart';
import { ClassPerformance } from '@/features/dashboard/components/ClassPerformance';
import { AttendanceHeatmap } from '@/features/dashboard/components/AttendanceHeatmap';
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { EmptyState } from '@/components/shared/EmptyState';
import { ExportButton } from '@/components/shared/ExportButton';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, Filter, RefreshCw, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { CanonicalMember } from '@/types/member';

function DashboardSkeleton() {
  return (
    <div style={{ padding: '40px 40px 80px' }} className="space-y-[18px]">
      <div style={{ height: 40 }} className="w-96 rounded-xl">
        <Skeleton className="h-10 w-96 rounded-xl" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18 }}>
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-28 rounded-2xl" />
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18 }}>
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

function DashboardContent({ uploadId }: { uploadId: string }) {
  const { data, isLoading, isError, error, refetch } = useDashboardData(uploadId);

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          icon={LayoutDashboard}
          title="Failed to load dashboard"
          description={error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </div>
    );
  }

  if (!data || data.status !== 'completed') {
    return (
      <div className="p-6">
        <EmptyState
          icon={LayoutDashboard}
          title="Processing incomplete"
          description="This upload hasn't finished processing yet."
          action={{ label: 'Go Back', onClick: () => window.history.back() }}
        />
      </div>
    );
  }

  const { metrics, normalizedData } = data;
  const activeCount = metrics.kpis.totalActiveMembers;
  const tierCount = metrics.membershipTypeDistribution.length;
  const revDelta = metrics.kpis.totalRevenue != null ? '' : '';

  const btnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '6px 12px',
    borderRadius: 9,
    fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--fg-strong)',
    cursor: 'pointer',
    boxShadow: '0 1px 0 rgba(15,17,33,.04)',
  };

  return (
    <div style={{ padding: '40px 40px 80px', maxWidth: 1520, margin: '0 auto' }}>

      {/* Hero head */}
      <div
        className="flex flex-wrap items-end justify-between gap-6"
        style={{ marginBottom: 28 }}
      >
        <div>
          <div
            className="flex items-center gap-2 text-[13.5px] font-medium mb-1.5"
            style={{ color: 'var(--muted-foreground)', letterSpacing: '-0.005em' }}
          >
            <span
              className="rounded-full"
              style={{ width: 6, height: 6, background: 'var(--pos)', flexShrink: 0 }}
            />
            Live · {data.fileName1}
          </div>
          <h1
            className="m-0 leading-[1.05]"
            style={{
              fontSize: 40, fontWeight: 590, letterSpacing: '-0.035em',
              color: 'var(--fg-strong)', maxWidth: 760,
            }}
          >
            A{' '}
            <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent-ink)', letterSpacing: '-0.01em' }}>
              sharper
            </em>
            {' '}look at your studio.
          </h1>
          <p
            style={{
              fontSize: 15, color: 'var(--muted-foreground)', marginTop: 12,
              maxWidth: 640, lineHeight: 1.55, letterSpacing: '-0.005em',
            }}
          >
            {activeCount} active members across {tierCount} membership tiers.
            Uploaded {formatDate(data.createdAt)}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button style={btnStyle}>
            <Filter style={{ width: 14, height: 14 }} />
            Filters
          </button>
          <button style={btnStyle} onClick={() => refetch()}>
            <RefreshCw style={{ width: 14, height: 14 }} />
            Refresh
          </button>
          <ExportButton uploadId={uploadId} members={normalizedData.members as CanonicalMember[]} metrics={metrics} />
          <a
            href="/"
            style={{
              ...btnStyle,
              background: 'var(--fg-strong)',
              color: 'var(--background)',
              borderColor: 'var(--fg-strong)',
              textDecoration: 'none',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            New upload
          </a>
        </div>
      </div>

      {/* Hero grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18, marginBottom: 18 }}>
        <FeaturedKpi kpis={metrics.kpis} churnData={metrics.churnData} />
        <RevenueChart data={metrics.revenueByType} />
      </div>

      {/* KPI strip */}
      <MetricCards kpis={metrics.kpis} />

      {/* Row: Attendance + Churn */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18, marginTop: 18 }}>
        <AttendanceChart data={metrics.attendanceByStyle} />
        <ChurnChart data={metrics.churnData} churnRate={metrics.kpis.churnRate} retentionRate={metrics.kpis.retentionRate} />
      </div>

      {/* Row: Top classes + Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18, marginTop: 18 }}>
        <ClassPerformance data={metrics.topClasses} />
        <AttendanceHeatmap data={metrics.attendanceByDay} />
      </div>

      {/* Row: Activity + Membership mix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
        {/* Activity feed */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 1px 0 rgba(15,17,33,.04)',
            overflow: 'hidden',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}
          >
            <h3
              className="m-0"
              style={{ fontSize: 13.5, fontWeight: 550, letterSpacing: '-0.005em', color: 'var(--fg-strong)' }}
            >
              Recent activity
            </h3>
            <span
              className="text-[12px] cursor-pointer"
              style={{ color: 'var(--fg-faint)' }}
            >
              View all →
            </span>
          </div>
          <div style={{ padding: '8px 22px 16px' }}>
            <ActivityFeed members={normalizedData.members as CanonicalMember[]} />
          </div>
        </div>

        <MembershipChart data={metrics.membershipTypeDistribution} />
      </div>

      {/* Footer */}
      <div
        className="flex justify-between text-[12px] mt-8 pt-6"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-faint)' }}
      >
        <span>X-Dance Studio · Amsterdam, NL</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          Generated {formatDate(data.createdAt)}
        </span>
      </div>
    </div>
  );
}

export function DashboardPageContent() {
  const searchParams = useSearchParams();
  const uploadId = searchParams.get('uploadId');

  if (!uploadId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={LayoutDashboard}
          title="No data yet"
          description="Upload your GetGrib Excel files to see your dance studio analytics."
          action={{ label: 'Upload files', onClick: () => (window.location.href = '/') }}
        />
      </div>
    );
  }

  return <DashboardContent uploadId={uploadId} />;
}
