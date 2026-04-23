import type { CanonicalMember, CanonicalAttendance } from '@/types/member';
import type { DashboardMetrics } from '@/types/metrics';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function computeMetrics(
  members: CanonicalMember[],
  attendance: CanonicalAttendance[]
): DashboardMetrics {
  const activeMembers = members.filter((m) => m.membershipStatus === 'active');
  const cancelledMembers = members.filter((m) => m.membershipStatus === 'cancelled');
  const newMembers = members.filter((m) => {
    if (!m.startDate) return false;
    const start = new Date(m.startDate);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return start >= monthAgo;
  });

  const churnRate =
    members.length > 0
      ? (cancelledMembers.length / members.length) * 100
      : 0;

  const feesWithData = activeMembers.filter((m) => m.monthlyFee != null);
  const totalRevenue = feesWithData.reduce((s, m) => s + (m.monthlyFee ?? 0), 0);
  const avgRevenue = feesWithData.length > 0 ? totalRevenue / feesWithData.length : null;

  // Membership type distribution
  const typeCount: Record<string, number> = {};
  for (const m of members) {
    typeCount[m.membershipType] = (typeCount[m.membershipType] ?? 0) + 1;
  }
  const membershipTypeDistribution = Object.entries(typeCount).map(([type, count]) => ({
    type,
    count,
    percentage: members.length > 0 ? (count / members.length) * 100 : 0,
  })).sort((a, b) => b.count - a.count);

  // Attendance by style
  const styleCount: Record<string, number> = {};
  for (const a of attendance) {
    const style = a.danceStyle ?? a.className ?? 'Unknown';
    styleCount[style] = (styleCount[style] ?? 0) + 1;
  }
  const attendanceByStyle = Object.entries(styleCount)
    .map(([style, checkIns]) => ({ style, checkIns }))
    .sort((a, b) => b.checkIns - a.checkIns)
    .slice(0, 10);

  // Attendance by day
  const dayCount: Record<string, number> = {};
  for (const a of attendance) {
    if (!a.checkInDate) continue;
    const day = DAYS[new Date(a.checkInDate).getDay()];
    dayCount[day] = (dayCount[day] ?? 0) + 1;
  }
  const attendanceByDay = DAYS.map((day) => ({ day, checkIns: dayCount[day] ?? 0 }));

  // Top classes
  const classData: Record<string, { checkIns: number; members: Set<string> }> = {};
  for (const a of attendance) {
    const cls = a.className ?? 'Unknown';
    if (!classData[cls]) classData[cls] = { checkIns: 0, members: new Set() };
    classData[cls].checkIns++;
    if (a.memberId) classData[cls].members.add(a.memberId);
  }
  const topClasses = Object.entries(classData)
    .map(([className, d]) => ({ className, checkIns: d.checkIns, uniqueMembers: d.members.size }))
    .sort((a, b) => b.checkIns - a.checkIns)
    .slice(0, 8);

  // Revenue by type
  const revenueByType = Object.entries(typeCount).map(([ type, memberCount]) => {
    const typeMembers = activeMembers.filter((m) => m.membershipType === type && m.monthlyFee != null);
    const revenue = typeMembers.reduce((s, m) => s + (m.monthlyFee ?? 0), 0);
    return { type, revenue, memberCount };
  });

  // Churn data (simple single period)
  const churnData = [
    {
      period: 'This Period',
      churned: cancelledMembers.length,
      newMembers: newMembers.length,
      net: newMembers.length - cancelledMembers.length,
    },
  ];

  return {
    kpis: {
      totalActiveMembers: activeMembers.length,
      newMembersThisPeriod: newMembers.length,
      churnedThisPeriod: cancelledMembers.length,
      churnRate,
      averageRevenuePerMember: avgRevenue,
      totalRevenue: feesWithData.length > 0 ? totalRevenue : null,
      totalCheckIns: attendance.length,
      retentionRate: 100 - churnRate,
    },
    membershipTypeDistribution,
    attendanceByStyle,
    attendanceByDay,
    topClasses,
    revenueByType,
    churnData,
    periodLabel: 'Current Upload',
    generatedAt: new Date().toISOString(),
  };
}
