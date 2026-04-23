'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from '@/constants/config';

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function FileDropzone({
  files,
  onFilesChange,
  maxFiles = 2,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFiles = (incoming: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];
    for (const file of incoming) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        errors.push(`"${file.name}" is not a valid Excel file (.xlsx or .xls).`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
        continue;
      }
      valid.push(file);
    }
    return { valid, errors };
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const dropped = Array.from(e.dataTransfer.files);
      const { valid, errors: errs } = validateFiles(dropped);
      setErrors(errs);
      const combined = [...files, ...valid].slice(0, maxFiles);
      onFilesChange(combined);
    },
    [files, maxFiles, onFilesChange, disabled]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const { valid, errors: errs } = validateFiles(selected);
    setErrors(errs);
    const combined = [...files, ...valid].slice(0, maxFiles);
    onFilesChange(combined);
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    onFilesChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && document.getElementById('file-input')?.click()}
        aria-label="Upload Excel files"
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={handleFileInput}
          disabled={disabled}
        />
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-1">
          Upload your two GetGrib Excel exports
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Drag & drop or click to select files
        </p>
        <p className="text-xs text-muted-foreground">
          .xlsx or .xls only — max {MAX_FILE_SIZE_MB}MB each
        </p>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1">
          {errors.map((err, i) => (
            <li key={i} className="text-sm text-destructive flex items-center gap-2">
              <X className="h-3 w-3 flex-shrink-0" /> {err}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3"
            >
              <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
