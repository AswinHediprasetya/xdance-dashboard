'use client';

import { CheckCircle2, XCircle, X, Info } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg w-80 animate-in slide-in-from-bottom-2 fade-in-0',
            t.variant === 'success' && 'bg-card border-green-500/30',
            t.variant === 'destructive' && 'bg-card border-destructive/30',
            t.variant === 'default' && 'bg-card border-border',
          )}
        >
          <span className="mt-0.5 flex-shrink-0">
            {t.variant === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {t.variant === 'destructive' && <XCircle className="h-4 w-4 text-destructive" />}
            {t.variant === 'default' && <Info className="h-4 w-4 text-muted-foreground" />}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{t.title}</p>
            {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
