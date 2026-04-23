'use client';
import { useEffect, useState } from 'react';

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.replace('#', ''), 16);
  const pb = parseInt(b.replace('#', ''), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return '#' + [r, g, bl].map(x => x.toString(16).padStart(2, '0')).join('');
}

function buildPalette(isDark: boolean) {
  const accent = isDark ? '#818cf8' : '#6366f1';
  const bgElev = isDark ? '#1a1d2e' : '#ffffff';
  const bgSunk = isDark ? '#0f111a' : '#f4f4f7';
  const fgStrong = isDark ? '#f5f5f7' : '#1a1a24';
  const fgFaint = isDark ? '#7a7d8c' : '#a8abb8';
  const hair = isDark ? '#252836' : '#e8e8ee';
  return {
    accent,
    accentLite: mix(accent, '#ffffff', 0.30),
    accentLiter: mix(accent, '#ffffff', 0.55),
    accentMuted: mix(accent, '#ffffff', 0.75),
    bgElev, bgSunk, fgStrong, fgFaint, hair,
    mix,
  };
}

export type ChartPalette = Omit<ReturnType<typeof buildPalette>, 'mix'> & { mix: typeof mix };

export function useChartPalette(): ReturnType<typeof buildPalette> {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return buildPalette(isDark);
}
