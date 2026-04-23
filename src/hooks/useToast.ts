'use client';

import { useUiStore } from '@/stores/uiStore';

export function useToast() {
  const { addToast, removeToast, toasts } = useUiStore();

  const toast = (opts: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
  }) => {
    const id = crypto.randomUUID();
    addToast({ id, title: opts.title, description: opts.description, variant: opts.variant ?? 'default' });
    setTimeout(() => removeToast(id), 4000);
  };

  return { toast, toasts, removeToast };
}
