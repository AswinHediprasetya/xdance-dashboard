'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import type { CanonicalMember } from '@/types/member';
import type { DashboardMetrics } from '@/types/metrics';

interface ExportButtonProps {
  uploadId: string;
  members: CanonicalMember[];
  metrics: DashboardMetrics;
}

function membersToRows(members: CanonicalMember[]) {
  return members.map((m) => ({
    'Member ID': m.memberId,
    'First Name': m.firstName,
    'Last Name': m.lastName,
    'Email': m.email,
    'Phone': m.phone ?? '',
    'Date of Birth': m.dateOfBirth ?? '',
    'Membership Type': m.membershipType,
    'Status': m.membershipStatus,
    'Start Date': m.startDate,
    'End Date': m.endDate ?? '',
    'Last Check-in': m.lastCheckIn ?? '',
    'Total Check-ins': m.totalCheckIns ?? '',
    'Monthly Fee (€)': m.monthlyFee ?? '',
    'Outstanding Balance (€)': m.outstandingBalance ?? '',
    'Dance Style': m.danceStyle ?? '',
    'Level': m.level ?? '',
    'Notes': m.notes ?? '',
  }));
}

function metricsToRows(metrics: DashboardMetrics) {
  const { kpis } = metrics;
  return [
    { Metric: 'Total Active Members', Value: kpis.totalActiveMembers },
    { Metric: 'New Members This Period', Value: kpis.newMembersThisPeriod },
    { Metric: 'Churned This Period', Value: kpis.churnedThisPeriod },
    { Metric: 'Churn Rate (%)', Value: kpis.churnRate.toFixed(1) },
    { Metric: 'Retention Rate (%)', Value: kpis.retentionRate.toFixed(1) },
    { Metric: 'Avg Revenue / Member (€)', Value: kpis.averageRevenuePerMember?.toFixed(2) ?? 'N/A' },
    { Metric: 'Total Revenue (€)', Value: kpis.totalRevenue?.toFixed(2) ?? 'N/A' },
    { Metric: 'Total Check-ins', Value: kpis.totalCheckIns },
  ];
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ uploadId, members, metrics }: ExportButtonProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const baseName = `xdance-export-${uploadId.slice(0, 8)}-${dateStr}`;

  const exportCsv = () => {
    setBusy(true);
    try {
      const rows = membersToRows(members);
      if (rows.length === 0) {
        toast({ title: 'No data to export', variant: 'destructive' });
        return;
      }
      const headers = Object.keys(rows[0]);
      const escape = (v: string) =>
        v.includes(',') || v.includes('"') || v.includes('\n')
          ? `"${v.replace(/"/g, '""')}"`
          : v;
      const lines = [
        headers.join(','),
        ...rows.map((row) =>
          headers.map((h) => escape(String((row as Record<string, unknown>)[h] ?? ''))).join(',')
        ),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(blob, `${baseName}.csv`);
      toast({ title: 'CSV downloaded', description: `${rows.length} members exported`, variant: 'success' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not generate CSV file.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const exportXlsx = () => {
    setBusy(true);
    try {
      const wb = XLSX.utils.book_new();
      const membersWs = XLSX.utils.json_to_sheet(membersToRows(members));
      XLSX.utils.book_append_sheet(wb, membersWs, 'Members');
      const metricsWs = XLSX.utils.json_to_sheet(metricsToRows(metrics));
      XLSX.utils.book_append_sheet(wb, metricsWs, 'Metrics Summary');
      XLSX.writeFile(wb, `${baseName}.xlsx`);
      toast({ title: 'Excel file downloaded', description: 'Members + Metrics Summary sheets', variant: 'success' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not generate Excel file.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
        disabled={busy}
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportCsv}>
          <FileText className="h-4 w-4" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportXlsx}>
          <FileSpreadsheet className="h-4 w-4" />
          Download as Excel (.xlsx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
