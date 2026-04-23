export const uploadKeys = {
  all: ['uploads'] as const,
  lists: () => [...uploadKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...uploadKeys.lists(), filters] as const,
  detail: (id: string) => [...uploadKeys.all, id] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: (uploadId: string) => [...dashboardKeys.all, 'metrics', uploadId] as const,
  chart: (uploadId: string, type: string) => [...dashboardKeys.all, 'chart', uploadId, type] as const,
};

export const processingKeys = {
  all: ['processing'] as const,
  status: (uploadId: string) => [...processingKeys.all, 'status', uploadId] as const,
};
