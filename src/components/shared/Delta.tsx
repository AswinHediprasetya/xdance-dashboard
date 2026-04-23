'use client';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface DeltaProps {
  value: number | null | undefined;
  unit?: string;
  invertColor?: boolean;
}

export function Delta({ value, unit = '%', invertColor = false }: DeltaProps) {
  if (value == null) return null;
  const positive = value > 0;
  const colorPositive = invertColor ? !positive : positive;
  const style = colorPositive
    ? { color: 'var(--pos)', background: 'color-mix(in oklab, var(--pos) 12%, transparent)' }
    : { color: 'var(--neg)', background: 'color-mix(in oklab, var(--neg) 12%, transparent)' };

  return (
    <span
      style={style}
      className="inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums px-[7px] py-0.5 rounded-full leading-none"
    >
      {positive
        ? <ArrowUp style={{ width: 11, height: 11 }} />
        : <ArrowDown style={{ width: 11, height: 11 }} />}
      {(positive ? '+' : '')}{Math.abs(value).toFixed(1)}{unit}
    </span>
  );
}
