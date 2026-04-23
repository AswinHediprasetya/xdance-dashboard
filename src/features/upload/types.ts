import { z } from 'zod';

export const uploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .length(2, 'Exactly 2 files are required.')
    .refine((files) => files.every((f) => ['xlsx', 'xls'].includes(f.name.split('.').pop()?.toLowerCase() ?? '')), {
      message: 'All files must be .xlsx or .xls',
    }),
});

export type UploadFormValues = z.infer<typeof uploadSchema>;

export interface UploadResponse {
  uploadId: string;
  fileName1: string;
  fileName2: string;
  status: string;
  createdAt: string;
}
