'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DashboardFiltersProps {
  membershipTypes: string[];
  danceStyles: string[];
}

export function DashboardFilters({ membershipTypes, danceStyles }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedType = searchParams.get('membershipType') ?? '';
  const selectedStyle = searchParams.get('danceStyle') ?? '';

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('membershipType');
    params.delete('danceStyle');
    router.push(`?${params.toString()}`);
  };

  const hasFilters = selectedType || selectedStyle;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={selectedType || 'all'} onValueChange={(v) => v && setParam('membershipType', v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Membership type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {membershipTypes.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStyle || 'all'} onValueChange={(v) => v && setParam('danceStyle', v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Dance style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All styles</SelectItem>
          {danceStyles.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-3 w-3" /> Clear filters
        </Button>
      )}
    </div>
  );
}
