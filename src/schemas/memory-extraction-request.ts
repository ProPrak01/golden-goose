import { z } from 'zod';

export const memoryExtractionRequestSchema = z.object({
  occurredAt: z.iso.datetime(),
  sourceApp: z.string().trim().min(1).max(120).default('Kivi'),
  transcriptText: z.string().trim().min(1).max(4000),
});

export type MemoryExtractionRequest = z.infer<typeof memoryExtractionRequestSchema>;
