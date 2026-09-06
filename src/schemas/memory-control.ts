import { z } from 'zod';

export const memoryControlInputSchema = z.object({
  action: z.enum(['soft_expire', 'delete']),
  detail: z.string().trim().max(500).optional(),
});

export type MemoryControlInput = z.infer<typeof memoryControlInputSchema>;
