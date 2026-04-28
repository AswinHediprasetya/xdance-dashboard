'use client';

import { useEffect, useState } from 'react';
import { LessonKpiStrip } from '@/features/lessons/components/LessonKpiStrip';
import { ClassProfitabilityChart } from '@/features/lessons/components/ClassProfitabilityChart';
import { LocationPerformanceChart } from '@/features/lessons/components/LocationPerformanceChart';
import { TeacherPerformanceChart } from '@/features/lessons/components/TeacherPerformanceChart';
import { BreakEvenTable } from '@/features/lessons/components/BreakEvenTable';
import { DayPerformanceChart } from '@/features/lessons/components/DayPerformanceChart';
import type { LessonSummary } from '@/lib/lessonParser';

export function LessonsPageContent() {
  const [data, setData] = useState<LessonSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/lessons')
      .then(r => r.json())
      .then(j => {
        if (j.success) setData(j.data);
        else setError(j.error?.message ?? 'Failed to load');
      })
      .catch(() => setError('Network error'));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[13px]" style={{ color: 'var(--neg)' }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[13px] animate-pulse" style={{ color: 'var(--fg-faint)' }}>Loading lesson analysis…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-[28px] font-[700] tracking-[-0.03em] m-0"
            style={{ color: 'var(--fg-strong)', fontFamily: 'var(--font-display, serif)', fontStyle: 'italic' }}
          >
            Lesson Analysis
          </h1>
          <span
            className="text-[12px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'var(--accent-soft, #eef2ff)', color: 'var(--primary)' }}
          >
            {data.kpi.dataDate}
          </span>
        </div>
        <p className="text-[13.5px] mt-1 m-0" style={{ color: 'var(--muted-foreground)' }}>
          Financial performance across {data.kpi.totalClasses} classes · Teacher names anonymised per GDPR
        </p>
      </div>

      {/* KPI strip */}
      <div className="mb-6">
        <LessonKpiStrip kpi={data.kpi} />
      </div>

      {/* Row 1: Class profitability + Day performance */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <ClassProfitabilityChart classes={data.classes} />
        <DayPerformanceChart days={data.days} />
      </div>

      {/* Row 2: Location + Teacher */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <LocationPerformanceChart locations={data.locations} />
        <TeacherPerformanceChart teachers={data.teachers} />
      </div>

      {/* Row 3: Break-even full width */}
      <BreakEvenTable classes={data.classes} />
    </div>
  );
}
