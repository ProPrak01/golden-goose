import { z } from 'zod';
import { memoryTypeSchema } from '@/domain/memory';

export const memoryProposalInputSchema = z.object({
  occurredAt: z.iso.datetime(),
  sourceApp: z.string().trim().min(1).max(120).default('Kivi'),
  transcriptText: z.string().trim().min(1).max(4000),
  memoryStatement: z.string().trim().min(1).max(500),
  memoryType: memoryTypeSchema.default('fact'),
  isExplicit: z.literal(true),
});

export type MemoryProposalInput = z.infer<typeof memoryProposalInputSchema>;
