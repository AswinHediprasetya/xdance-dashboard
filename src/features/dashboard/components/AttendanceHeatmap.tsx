'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AttendanceByDay } from '@/types/metrics';

interface AttendanceHeatmapProps {
  data: AttendanceByDay[];
}

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attendance by Day of Week</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => v.slice(0, 3)}
            />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="checkIns" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Check-ins" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
