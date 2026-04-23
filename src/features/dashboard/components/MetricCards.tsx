'use client';

import { Users, UserPlus, TrendingDown, DollarSign, Activity, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { KpiMetrics } from '@/types/metrics';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface MetricCardsProps {
  kpis: KpiMetrics;
}

export function MetricCards({ kpis }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard
        title="Active Members"
        value={kpis.totalActiveMembers.toString()}
        icon={<Users className="h-4 w-4" />}
        description="Currently active memberships"
      />
      <MetricCard
        title="New This Period"
        value={kpis.newMembersThisPeriod.toString()}
        icon={<UserPlus className="h-4 w-4" />}
        description="Joined in the last 30 days"
      />
      <MetricCard
        title="Churn Rate"
        value={formatPercent(kpis.churnRate)}
        icon={<TrendingDown className="h-4 w-4" />}
        description={`${kpis.churnedThisPeriod} members cancelled`}
      />
      <MetricCard
        title="Avg Revenue / Member"
        value={kpis.averageRevenuePerMember != null ? formatCurrency(kpis.averageRevenuePerMember) : 'N/A'}
        icon={<DollarSign className="h-4 w-4" />}
        description={kpis.totalRevenue != null ? `Total: ${formatCurrency(kpis.totalRevenue)}` : 'No fee data'}
      />
      <MetricCard
        title="Total Check-ins"
        value={kpis.totalCheckIns.toString()}
        icon={<Activity className="h-4 w-4" />}
        description="Across all classes"
      />
    </div>
  );
}
