export interface CanonicalMember {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  membershipType: 'monthly' | 'quarterly' | 'annual' | 'drop-in' | 'trial' | string;
  membershipStatus: 'active' | 'inactive' | 'paused' | 'cancelled' | string;
  startDate: string;
  endDate: string | null;
  lastCheckIn: string | null;
  totalCheckIns: number | null;
  monthlyFee: number | null;
  outstandingBalance: number | null;
  danceStyle: string | null;
  level: string | null;
  notes: string | null;
}

export interface CanonicalAttendance {
  memberId: string | null;
  memberName: string | null;
  checkInDate: string;
  checkInTime: string | null;
  className: string | null;
  danceStyle: string | null;
  instructorName: string | null;
  attendeeCount: number | null;
}

export interface NormalizedDataset {
  members: CanonicalMember[];
  attendance: CanonicalAttendance[];
  columnMappings: {
    file1: import('@/lib/claude').ColumnMapping[];
    file2: import('@/lib/claude').ColumnMapping[];
  };
}
