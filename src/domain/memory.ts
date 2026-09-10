import { z } from 'zod';

export const memoryTypeSchema = z.enum(['fact', 'preference', 'episode', 'pattern']);
export const memoryStatusSchema = z.enum([
  'candidate',
  'active',
  'superseded',
  'soft_expired',
  'deleted',
  'rejected',
]);

export const memoryCandidateSchema = z.object({
  memoryType: memoryTypeSchema,
  canonicalStatement: z.string().trim().min(1),
  confidence: z.number().min(0).max(1),
  evidenceCount: z.number().int().positive(),
  isExplicit: z.boolean(),
  isSensitiveInference: z.boolean(),
});

export type MemoryCandidate = z.infer<typeof memoryCandidateSchema>;
export type MemoryStatus = z.infer<typeof memoryStatusSchema>;

export type MemoryDecision =
  | { kind: 'accept'; reason: string; nextStatus: 'active' }
  | { kind: 'reject'; reason: string; nextStatus: 'rejected' }
  | { kind: 'clarify'; reason: string; nextStatus: 'candidate' };

export type MemoryDecisionInput = MemoryCandidate & {
  /**
   * Optional full source text. When present, explicit source-level uncertainty
   * and boundaries outrank a model's candidate fields.
   */
  sourceText?: string;
};

const uncertaintyPattern =
  /\b(?:i(?:'m| am) not (?:sure|certain)|not (?:sure|certain) whether|maybe|might be)\b/i;
const protectedSelfLabelPattern =
  /\b(?:do not|don't|dont|never)\s+(?:label|call|describe|consider)\s+me\s+(?:as\s+)?[^.?!]*(?:lazy|unmotivated|incompetent|incapable|stupid|bad at)/i;

export function decideMemoryCandidate(input: MemoryDecisionInput): MemoryDecision {
  if (input.sourceText && protectedSelfLabelPattern.test(input.sourceText)) {
    return {
      kind: 'reject',
      nextStatus: 'rejected',
      reason: 'Kivi respects the user’s explicit boundary against personal labels.',
    };
  }

  if (input.sourceText && uncertaintyPattern.test(input.sourceText)) {
    return {
      kind: 'clarify',
      nextStatus: 'candidate',
      reason: 'The source explicitly describes this detail as uncertain.',
    };
  }

  if (input.isSensitiveInference) {
    return {
      kind: 'reject',
      nextStatus: 'rejected',
      reason: 'Kivi does not retain sensitive inferred traits.',
    };
  }

  if (!input.isExplicit) {
    return {
      kind: 'reject',
      nextStatus: 'rejected',
      reason: 'Memory requires an explicit user statement.',
    };
  }

  if (input.confidence < 0.7) {
    return {
      kind: 'clarify',
      nextStatus: 'candidate',
      reason: 'Evidence is too weak to create durable memory.',
    };
  }

  return {
    kind: 'accept',
    nextStatus: 'active',
    reason: 'Explicit evidence meets the memory confidence threshold.',
  };
}

const transitions: Record<MemoryStatus, readonly MemoryStatus[]> = {
  candidate: ['active', 'rejected', 'deleted'],
  active: ['superseded', 'soft_expired', 'deleted'],
  superseded: [],
  soft_expired: ['active', 'deleted'],
  deleted: [],
  rejected: [],
};

export function canTransitionMemory(from: MemoryStatus, to: MemoryStatus): boolean {
  return transitions[from].includes(to);
}
