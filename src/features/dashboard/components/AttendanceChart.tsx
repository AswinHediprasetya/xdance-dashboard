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
import type { AttendanceByStyle } from '@/types/metrics';

interface AttendanceChartProps {
  data: AttendanceByStyle[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = data.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attendance by Dance Style</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="style"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="checkIns" fill="#6366f1" radius={[4, 4, 0, 0]} name="Check-ins" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
