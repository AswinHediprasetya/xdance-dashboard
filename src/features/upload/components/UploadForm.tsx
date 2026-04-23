'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { ProcessingStatus } from '@/components/shared/ProcessingStatus';
import { MappingPreviewSection } from '@/components/shared/ColumnMappingPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUpload } from '../hooks/useUpload';
import { useProcessing } from '@/features/processing/hooks/useProcessing';
import { PROCESSING_STEPS } from '@/constants/config';
import type { ProcessingStepState } from '@/features/processing/types';
import type { ColumnMapping } from '@/lib/claude';
import { ArrowRight, FlaskConical, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { ApiSuccess } from '@/types/api';
import type { ProcessResult } from '@/features/processing/api';

type Phase = 'idle' | 'uploading' | 'processing' | 'preview' | 'error';

export function UploadForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<ProcessingStepState[]>(
    PROCESSING_STEPS.map((s) => ({ ...s, status: 'pending' }))
  );
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [columnMappings, setColumnMappings] = useState<{
    file1: ColumnMapping[];
    file2: ColumnMapping[];
  } | null>(null);
  const [sampleRows, setSampleRows] = useState<{
    file1: Record<string, unknown>[];
    file2: Record<string, unknown>[];
  } | null>(null);
  const [fileNames, setFileNames] = useState<{ file1: string; file2: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  const uploadMutation = useUpload();
  const processMutation = useProcessing();

  const resetSteps = () => setSteps(PROCESSING_STEPS.map((s) => ({ ...s, status: 'pending' })));

  const setStepStatus = (idx: number, status: ProcessingStepState['status']) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, status } : s)));
  };

  const applyProcessResult = (result: ProcessResult, id: string) => {
    setUploadId(id);
    setColumnMappings(result.columnMappings);
    setSampleRows(result.sampleRows);
    setFileNames(result.fileNames);
    setPhase('preview');
  };

  const handleSubmit = async () => {
    if (files.length !== 2) return;
    setErrorMsg(null);
    resetSteps();
    setPhase('uploading');

    try {
      setStepStatus(0, 'active');
      setPhase('processing');
      const uploadResult = await uploadMutation.mutateAsync(files);
      setStepStatus(0, 'done');

      setStepStatus(1, 'active');
      const processResult = await processMutation.mutateAsync(uploadResult.uploadId);
      setStepStatus(1, 'done');
      setStepStatus(2, 'done');
      setStepStatus(3, 'done');
      setStepStatus(4, 'done');

      applyProcessResult(processResult, uploadResult.uploadId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('error');
      setSteps((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error' } : s))
      );
    }
  };

  const handleSampleData = async () => {
    setErrorMsg(null);
    resetSteps();
    setIsSampleLoading(true);
    setPhase('processing');
    setStepStatus(0, 'done');
    setStepStatus(1, 'active');

    try {
      const response = await apiClient.post<ApiSuccess<ProcessResult>>('/process-sample', {});
      const result = response.data.data;
      setStepStatus(1, 'done');
      setStepStatus(2, 'done');
      setStepStatus(3, 'done');
      setStepStatus(4, 'done');
      applyProcessResult(result, result.uploadId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not load sample data. Please try again.');
      setPhase('error');
      setSteps((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error' } : s))
      );
    } finally {
      setIsSampleLoading(false);
    }
  };

  const handleViewDashboard = () => {
    if (uploadId) router.push(`/dashboard?uploadId=${uploadId}`);
  };

  const isProcessing = phase === 'uploading' || phase === 'processing';

  return (
    <div className="space-y-6">
      <FileDropzone
        files={files}
        onFilesChange={setFiles}
        disabled={isProcessing || isSampleLoading}
      />

      {(isProcessing || phase === 'preview' || phase === 'error') && (
        <Card>
          <CardContent className="pt-6">
            <ProcessingStatus steps={steps} />
          </CardContent>
        </Card>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-medium">{errorMsg}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setPhase('idle');
              resetSteps();
              setErrorMsg(null);
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {phase === 'preview' && columnMappings && sampleRows && fileNames && (
        <MappingPreviewSection
          file1Mappings={columnMappings.file1}
          file2Mappings={columnMappings.file2}
          file1SampleRows={sampleRows.file1}
          file2SampleRows={sampleRows.file2}
          file1Name={fileNames.file1}
          file2Name={fileNames.file2}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleSampleData}
          disabled={isProcessing || isSampleLoading}
        >
          {isSampleLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <FlaskConical className="h-4 w-4" />}
          Try with sample data
        </Button>

        <div className="flex gap-3">
          {phase === 'preview' && (
            <Button onClick={handleViewDashboard} size="lg" className="gap-2">
              View Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {(phase === 'idle' || phase === 'error') && (
            <Button
              onClick={handleSubmit}
              disabled={files.length !== 2 || isProcessing}
              size="lg"
              className="gap-2"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing…' : 'Upload & Process'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
