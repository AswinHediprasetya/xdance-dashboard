export interface KpiMetrics {
  totalActiveMembers: number;
  newMembersThisPeriod: number;
  churnedThisPeriod: number;
  churnRate: number;
  averageRevenuePerMember: number | null;
  totalRevenue: number | null;
  totalCheckIns: number;
  retentionRate: number;
}

export interface MembershipTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface AttendanceByStyle {
  style: string;
  checkIns: number;
}

export interface AttendanceByDay {
  day: string;
  checkIns: number;
}

export interface AttendanceByClass {
  className: string;
  checkIns: number;
  uniqueMembers: number;
}

export interface RevenueByType {
  type: string;
  revenue: number;
  memberCount: number;
}

export interface ChurnDataPoint {
  period: string;
  churned: number;
  newMembers: number;
  net: number;
}

export interface DashboardMetrics {
  kpis: KpiMetrics;
  membershipTypeDistribution: MembershipTypeDistribution[];
  attendanceByStyle: AttendanceByStyle[];
  attendanceByDay: AttendanceByDay[];
  topClasses: AttendanceByClass[];
  revenueByType: RevenueByType[];
  churnData: ChurnDataPoint[];
  periodLabel: string;
  generatedAt: string;
}
