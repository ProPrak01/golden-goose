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
    if (value.includes('preference')) return 'preference';
    if (value.includes('episode') || value.includes('lesson') || value.includes('reflection')) {
      return 'episode';
    }
    if (value.includes('pattern') || value.includes('habit')) return 'pattern';
    // Providers sometimes emit category labels such as `course_deadline`.
    // The explicitness and sensitive-inference gates still decide retention.
    return 'fact';
  })
  .pipe(memoryTypeSchema);

export const extractedMemoryCandidateSchema = z.object({
  memoryType: providerMemoryTypeSchema,
  canonicalStatement: z.string().trim().min(1).max(500),
  excerpt: z.string().trim().min(1).max(1000),
  confidence: z.preprocess((value) => {
    const parsed = typeof value === 'string' ? Number(value) : value;
    return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
  }, z.number().min(0).max(1)),
  isExplicit: z.preprocess(
    (value) => (value === 'true' ? true : value === 'false' ? false : value),
    z.boolean(),
  ),
  isSensitiveInference: z.preprocess(
    (value) => (value === 'true' ? true : value === 'false' ? false : value),
    z.boolean(),
  ),
});

export const memoryExtractionSchema = z.object({
  candidates: z.array(extractedMemoryCandidateSchema).max(3),
  reason: z.string().trim().min(1).max(500),
});

export type MemoryExtraction = z.infer<typeof memoryExtractionSchema>;
