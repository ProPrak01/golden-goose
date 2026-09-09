import { z } from 'zod';
import { memoryTypeSchema } from '@/domain/memory';

const providerMemoryTypeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => value.replaceAll(' ', '_'))
  .transform((value) => {
    if (['deadline', 'commitment', 'task', 'task_commitment', 'academic_fact'].includes(value)) {
      return 'fact';
    }
    if (['study_preference', 'work_preference', 'explicit_study_preference'].includes(value)) {
      return 'preference';
    }
    return value;
  })
  .pipe(memoryTypeSchema);

export const extractedMemoryCandidateSchema = z.object({
  memoryType: providerMemoryTypeSchema,
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
