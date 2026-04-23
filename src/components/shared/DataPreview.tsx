'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ColumnMapping } from '@/lib/claude';

interface DataPreviewProps {
  mappings: ColumnMapping[];
  label: string;
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
  if (confidence >= 0.5) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
}

export function DataPreview({ mappings, label }: DataPreviewProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Source Column</TableHead>
              <TableHead className="w-[200px]">Mapped To</TableHead>
              <TableHead>Transformation</TableHead>
              <TableHead className="w-[100px] text-center">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappings.map((m, i) => (
              <TableRow key={i} className={m.confidence < 0.5 ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}>
                <TableCell className="font-mono text-xs font-medium">{m.sourceColumn}</TableCell>
                <TableCell>
                  {m.canonicalField ? (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {m.canonicalField}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">unmapped</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{m.transformation || '—'}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColor(m.confidence)}`}
                  >
                    {Math.round(m.confidence * 100)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
