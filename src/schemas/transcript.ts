import { z } from 'zod';

export const transcriptInputSchema = z.object({
  occurredAt: z.iso.datetime(),
  sourceApp: z.string().trim().min(1).max(120).optional(),
  rawAsr: z.string().trim().min(1),
  formattedText: z.string().trim().min(1),
  context: z.record(z.string(), z.unknown()).default({}),
});

export type TranscriptInput = z.infer<typeof transcriptInputSchema>;
