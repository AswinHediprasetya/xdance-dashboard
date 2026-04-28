'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ColumnMapping } from '@/lib/claude';

// Fields that contain personal data — masked in the preview per GDPR Art. 5
const PII_FIELDS = new Set([
  'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'memberId',
  'outstandingBalance', 'notes', 'memberName',
]);

function maskField(field: string, val: unknown): React.ReactNode {
  if (val == null || val === '') return <span className="text-muted-foreground/50">—</span>;
  if (!PII_FIELDS.has(field)) return String(val);
  if (field === 'email') return <span className="text-muted-foreground/60 italic">●●●@●●●.●●●</span>;
  if (field === 'phone') return <span className="text-muted-foreground/60 italic">+●● ●●● ●●●●</span>;
  if (field === 'dateOfBirth') return <span className="text-muted-foreground/60 italic">●●●●-●●-●●</span>;
  if (field === 'outstandingBalance') return <span className="text-muted-foreground/60 italic">€●●●</span>;
  if (field === 'memberId') return <span className="text-muted-foreground/60 italic">ID-●●●●</span>;
  // Name fields: show first initial only
  const str = String(val).trim();
  return <span className="text-muted-foreground/70 italic">{str[0] ?? '●'}●●●</span>;
}

interface ConfidenceLevel {
  label: string;
  badgeClass: string;
  barClass: string;
}

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.9) return {
    label: 'High',
    badgeClass: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    barClass: 'bg-green-500',
  };
  if (score >= 0.7) return {
    label: 'Medium',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    barClass: 'bg-amber-500',
  };
  return {
    label: 'Low',
    badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    barClass: 'bg-red-500',
  };
}

interface MappingRowProps {
  mapping: ColumnMapping;
  index: number;
}

function MappingRow({ mapping, index }: MappingRowProps) {
  const [expanded, setExpanded] = useState(false);
  const conf = getConfidenceLevel(mapping.confidence);
  const hasDetails = !!(mapping.reasoning || mapping.transformation);

  return (
    <div className={cn(
      'border-b last:border-b-0 transition-colors',
      mapping.confidence < 0.7 && 'bg-red-50/40 dark:bg-red-950/20',
    )}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Index */}
        <span className="w-5 flex-shrink-0 text-xs text-muted-foreground tabular-nums">{index + 1}</span>

        {/* Raw column — "Before" */}
        <div className="w-44 flex-shrink-0">
          <code className="inline-block max-w-full truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground border border-border">
            {mapping.sourceColumn}
          </code>
        </div>

        {/* Arrow */}
        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden />

        {/* Canonical field — "After" */}
        <div className="flex-1 min-w-0">
          {mapping.canonicalField ? (
            <code className="inline-block max-w-full truncate rounded-md bg-primary/10 px-2 py-1 font-mono text-xs text-primary border border-primary/20">
              {mapping.canonicalField}
            </code>
          ) : (
            <span className="text-xs italic text-muted-foreground">unmapped</span>
          )}
        </div>

        {/* Confidence badge */}
        <span className={cn(
          'flex-shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums',
          conf.badgeClass,
        )}>
          {conf.label}
        </span>

        {/* Confidence bar */}
        <div className="w-16 flex-shrink-0 hidden sm:block">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', conf.barClass)}
              style={{ width: `${mapping.confidence * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">{Math.round(mapping.confidence * 100)}%</span>
        </div>

        {/* Expand toggle */}
        {hasDetails && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label={expanded ? 'Collapse reasoning' : 'Expand reasoning'}
          >
            {expanded
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        {!hasDetails && <span className="w-4 flex-shrink-0" />}
      </div>

      {expanded && hasDetails && (
        <div className="px-4 pb-3 pl-12 space-y-1">
          {mapping.transformation && mapping.transformation !== 'none' && mapping.transformation !== 'None' && (
            <p className="text-xs text-foreground">
              <span className="font-medium">Transformation:</span>{' '}
              <span className="text-muted-foreground">{mapping.transformation}</span>
            </p>
          )}
          {mapping.reasoning && (
            <p className="text-xs text-muted-foreground italic">{mapping.reasoning}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ColumnMappingPreviewProps {
  mappings: ColumnMapping[];
  fileName: string;
  sampleRows: Record<string, unknown>[];
}

export function ColumnMappingPreview({ mappings, fileName, sampleRows }: ColumnMappingPreviewProps) {
  const mapped = mappings.filter((m) => m.canonicalField);
  const highConf = mappings.filter((m) => m.confidence >= 0.9).length;
  const lowConf = mappings.filter((m) => m.confidence < 0.7).length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground font-medium truncate">{fileName}</span>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <span className="rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 text-xs font-medium">
            {highConf} high confidence
          </span>
          {lowConf > 0 && (
            <span className="rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 text-xs font-medium">
              {lowConf} low confidence
            </span>
          )}
          <span className="text-xs text-muted-foreground">{mapped.length}/{mappings.length} mapped</span>
        </div>
      </div>

      {/* Column header */}
      <div className="flex items-center gap-3 px-4 pb-2 border-b">
        <span className="w-5 flex-shrink-0" />
        <div className="w-44 flex-shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Raw Export</span>
        </div>
        <span className="w-3.5 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Normalized Schema</span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[72px] flex-shrink-0 hidden sm:block text-right pr-1">Score</span>
      </div>

      {/* Mapping rows */}
      <div className="rounded-xl border overflow-hidden divide-y-0 bg-card">
        {mappings.map((m, i) => (
          <MappingRow key={i} mapping={m} index={i} />
        ))}
      </div>

      {/* Data preview table */}
      {sampleRows.length > 0 && mapped.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Data preview — first {sampleRows.length} rows after normalization
            <span className="ml-2 normal-case font-normal text-muted-foreground/70">(sensitive fields masked · GDPR)</span>
          </p>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  {mapped.map((m) => (
                    <TableHead key={m.canonicalField} className="font-mono text-xs whitespace-nowrap py-2">
                      {m.canonicalField}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleRows.map((row, i) => (
                  <TableRow key={i}>
                    {mapped.map((m) => {
                      const val = m.canonicalField ? row[m.canonicalField] : undefined;
                      const masked = maskField(m.canonicalField ?? '', val);
                      return (
                        <TableCell key={m.canonicalField} className="font-mono text-xs max-w-[160px] truncate py-2">
                          {masked}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

interface MappingPreviewSectionProps {
  file1Mappings: ColumnMapping[];
  file2Mappings: ColumnMapping[];
  file1SampleRows: Record<string, unknown>[];
  file2SampleRows: Record<string, unknown>[];
  file1Name: string;
  file2Name: string;
}

export function MappingPreviewSection({
  file1Mappings,
  file2Mappings,
  file1SampleRows,
  file2SampleRows,
  file1Name,
  file2Name,
}: MappingPreviewSectionProps) {
  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-xl border-b">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">AI Column Mapping</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Claude mapped your Dutch export columns to the canonical schema.
              Click any row to see the reasoning.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-10">
        <ColumnMappingPreview
          mappings={file1Mappings}
          fileName={file1Name}
          sampleRows={file1SampleRows}
        />
        <div className="border-t pt-8">
          <ColumnMappingPreview
            mappings={file2Mappings}
            fileName={file2Name}
            sampleRows={file2SampleRows}
          />
        </div>
      </CardContent>
    </Card>
  );
}
