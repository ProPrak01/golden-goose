import { z } from 'zod';

export const memoryCorrectionInputSchema = z.object({
  canonicalStatement: z.string().trim().min(1).max(500),
  detail: z.string().trim().min(1).max(500),
  occurredAt: z.iso.datetime(),
});

export type MemoryCorrectionInput = z.infer<typeof memoryCorrectionInputSchema>;
