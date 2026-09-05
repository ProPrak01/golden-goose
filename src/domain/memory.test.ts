import { describe, expect, it } from 'vitest';
import { canTransitionMemory, decideMemoryCandidate } from '@/domain/memory';

describe('memory policy', () => {
  it('accepts explicit, well-supported memory', () => {
    expect(
      decideMemoryCandidate({
        memoryType: 'fact',
        canonicalStatement: 'Assignment is due Friday.',
        confidence: 0.9,
        evidenceCount: 1,
        isExplicit: true,
        isSensitiveInference: false,
      }),
    ).toMatchObject({ kind: 'accept', nextStatus: 'active' });
  });

  it('rejects inferred personal traits', () => {
    expect(
      decideMemoryCandidate({
        memoryType: 'pattern',
        canonicalStatement: 'The user is lazy.',
        confidence: 0.95,
        evidenceCount: 1,
        isExplicit: false,
        isSensitiveInference: true,
      }),
    ).toMatchObject({ kind: 'reject', nextStatus: 'rejected' });
  });

  it('only permits auditable lifecycle transitions', () => {
    expect(canTransitionMemory('active', 'soft_expired')).toBe(true);
    expect(canTransitionMemory('deleted', 'active')).toBe(false);
  });
});
