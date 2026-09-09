import { z } from 'zod';
import { memoryTypeSchema } from '@/domain/memory';

export const extractedMemoryCandidateSchema = z.object({
  memoryType: memoryTypeSchema,
  canonicalStatement: z.string().trim().min(1).max(500),
  excerpt: z.string().trim().min(1).max(1000),
  confidence: z.number().min(0).max(1),
  isExplicit: z.boolean(),
  isSensitiveInference: z.boolean(),
});

export const memoryExtractionSchema = z.object({
  candidates: z.array(extractedMemoryCandidateSchema).max(3),
  reason: z.string().trim().min(1).max(500),
});

export type MemoryExtraction = z.infer<typeof memoryExtractionSchema>;
