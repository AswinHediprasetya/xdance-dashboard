'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useUploadList } from '@/features/dashboard/hooks/useDashboardData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { History, ArrowRight, Upload, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed';

const statusConfig: Record<UploadStatus, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  completed: { label: 'Completed', icon: <CheckCircle2 className="h-3 w-3" />, variant: 'default' },
  failed: { label: 'Failed', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
  processing: { label: 'Processing', icon: <Loader2 className="h-3 w-3 animate-spin" />, variant: 'secondary' },
  pending: { label: 'Pending', icon: <Clock className="h-3 w-3" />, variant: 'outline' },
};

function UploadRow({ upload }: { upload: any }) {
  const status = upload.status as UploadStatus;
  const cfg = statusConfig[status] ?? statusConfig.pending;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{upload.fileName1}</p>
        <p className="text-xs text-muted-foreground truncate">{upload.fileName2}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatDate(upload.createdAt)}</p>
      </div>
      <Badge variant={cfg.variant} className="flex items-center gap-1">
        {cfg.icon} {cfg.label}
      </Badge>
      {status === 'completed' && (
        <Link
          href={`/dashboard?uploadId=${upload.id}`}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[0.8rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function UploadListContent() {
  const { data, isLoading, isError, refetch } = useUploadList();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={History}
        title="Failed to load history"
        description="Could not fetch your upload history. Please try again."
        action={{ label: 'Retry', onClick: () => refetch() }}
      />
    );
  }

  if (!data?.data.length) {
    return (
      <EmptyState
        icon={Upload}
        title="No uploads yet"
        description="Upload your first GetGrib Excel exports to get started."
        action={{ label: 'Upload files', onClick: () => (window.location.href = '/') }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.data.map((upload: any) => (
        <UploadRow key={upload.id} upload={upload} />
      ))}
      <p className="text-xs text-muted-foreground text-center pt-2">
        Showing {data.data.length} of {data.meta.total} uploads
      </p>
    </div>
  );
}

export default function UploadsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Upload History</h1>
          <p className="text-sm text-muted-foreground">All your GetGrib data uploads</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          <Upload className="h-3.5 w-3.5" /> New Upload
        </Link>
      </div>
      <Suspense fallback={<Skeleton className="h-20" />}>
        <UploadListContent />
      </Suspense>
    </div>
  );
}
