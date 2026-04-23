'use client';

import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProcessingStepState } from '@/features/processing/types';

interface ProcessingStatusProps {
  steps: ProcessingStepState[];
}

export function ProcessingStatus({ steps }: ProcessingStatusProps) {
  return (
    <ol className="space-y-3">
      {steps.map((step, idx) => (
        <li key={step.id} className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
              step.status === 'done' && 'border-green-500 bg-green-500 text-white',
              step.status === 'active' && 'border-primary bg-primary/10 text-primary',
              step.status === 'error' && 'border-destructive bg-destructive/10 text-destructive',
              step.status === 'pending' && 'border-border bg-muted text-muted-foreground'
            )}
          >
            {step.status === 'done' && <Check className="h-4 w-4" />}
            {step.status === 'active' && <Loader2 className="h-4 w-4 animate-spin" />}
            {step.status === 'error' && <AlertCircle className="h-4 w-4" />}
            {step.status === 'pending' && <Clock className="h-4 w-4" />}
          </div>
          <div>
            <p
              className={cn(
                'text-sm font-medium transition-colors',
                step.status === 'active' && 'text-primary',
                step.status === 'done' && 'text-foreground',
                step.status === 'error' && 'text-destructive',
                step.status === 'pending' && 'text-muted-foreground'
              )}
            >
              {step.label}
            </p>
            {step.status === 'active' && (
              <p className="text-xs text-muted-foreground">Processing...</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
