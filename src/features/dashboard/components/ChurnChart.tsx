'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChurnDataPoint } from '@/types/metrics';

interface ChurnChartProps {
  data: ChurnDataPoint[];
  churnRate: number;
  retentionRate: number;
}

export function ChurnChart({ data, churnRate, retentionRate }: ChurnChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Churn & Growth Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Retention Rate</span>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {retentionRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Churn Rate</span>
            <p className="text-xl font-bold text-red-500">{churnRate.toFixed(1)}%</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="newMembers" fill="#22c55e" radius={[4, 4, 0, 0]} name="New Members" />
            <Bar dataKey="churned" fill="#ef4444" radius={[4, 4, 0, 0]} name="Churned" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
