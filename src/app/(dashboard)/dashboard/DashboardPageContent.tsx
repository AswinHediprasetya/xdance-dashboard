'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useDashboardData, useUploadList } from '@/features/dashboard/hooks/useDashboardData';
import { MetricCards } from '@/features/dashboard/components/MetricCards';
import { MembershipChart } from '@/features/dashboard/components/MembershipChart';
import { AttendanceChart } from '@/features/dashboard/components/AttendanceChart';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { ChurnChart } from '@/features/dashboard/components/ChurnChart';
import { ClassPerformance } from '@/features/dashboard/components/ClassPerformance';
import { AttendanceHeatmap } from '@/features/dashboard/components/AttendanceHeatmap';
import { DashboardFilters } from '@/features/dashboard/components/DashboardFilters';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LayoutDashboard } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { CanonicalMember, CanonicalAttendance } from '@/types/member';
import { ExportButton } from '@/components/shared/ExportButton';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function DashboardContent({ uploadId }: { uploadId: string }) {
  const { data, isLoading, isError, error, refetch } = useDashboardData(uploadId);
  const searchParams = useSearchParams();
  const membershipTypeFilter = searchParams.get('membershipType');
  const danceStyleFilter = searchParams.get('danceStyle');

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
  const membershipTypes = [...new Set(normalizedData.members.map((m: CanonicalMember) => m.membershipType))];
  const danceStyles = [
    ...new Set([
      ...normalizedData.members.map((m: CanonicalMember) => m.danceStyle).filter(Boolean),
      ...normalizedData.attendance.map((a: CanonicalAttendance) => a.danceStyle).filter(Boolean),
    ]),
  ] as string[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {data.fileName1} + {data.fileName2} · {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardFilters
            membershipTypes={membershipTypes as string[]}
            danceStyles={danceStyles}
          />
          <ExportButton uploadId={uploadId} members={normalizedData.members} metrics={metrics} />
        </div>
      </div>

      <MetricCards kpis={metrics.kpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MembershipChart data={metrics.membershipTypeDistribution} />
        <AttendanceChart data={metrics.attendanceByStyle} />
        <RevenueChart data={metrics.revenueByType} />
        <ChurnChart
          data={metrics.churnData}
          churnRate={metrics.kpis.churnRate}
          retentionRate={metrics.kpis.retentionRate}
        />
        <AttendanceHeatmap data={metrics.attendanceByDay} />
        <ClassPerformance data={metrics.topClasses} />
      </div>
    </div>
  );
}

function UploadSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUploadId = searchParams.get('uploadId') ?? '';
  const { data, isLoading } = useUploadList();

  const completedUploads = data?.data.filter((u: any) => u.status === 'completed') ?? [];

  return (
    <div className="w-52">
      <Select
        value={currentUploadId}
        onValueChange={(id) => {
          if (!id) return;
          const params = new URLSearchParams(searchParams.toString());
          params.set('uploadId', id);
          router.push(`?${params.toString()}`);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? 'Loading…' : 'Select upload'} />
        </SelectTrigger>
        <SelectContent>
          {completedUploads.map((u: any) => (
            <SelectItem key={u.id} value={u.id}>
              {formatDate(u.createdAt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
