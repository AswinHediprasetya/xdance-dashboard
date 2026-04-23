'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AttendanceByClass } from '@/types/metrics';

interface ClassPerformanceProps {
  data: AttendanceByClass[];
}

export function ClassPerformance({ data }: ClassPerformanceProps) {
  const max = Math.max(...data.map((d) => d.checkIns), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Performing Classes</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No class data available in this upload.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.map((cls, idx) => (
              <li key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-4">{idx + 1}</span>
                    <span className="text-sm font-medium text-foreground">{cls.className}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {cls.uniqueMembers} members
                    </Badge>
                    <span className="text-sm font-bold text-primary">{cls.checkIns}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(cls.checkIns / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
