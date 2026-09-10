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

  it('respects an explicit source boundary even when extraction keeps a factual fragment', () => {
    expect(
      decideMemoryCandidate({
        memoryType: 'fact',
        canonicalStatement: 'The user missed one Algorithms deadline.',
        confidence: 1,
        evidenceCount: 1,
        isExplicit: true,
        isSensitiveInference: false,
        sourceText: 'I missed one Algorithms deadline, so do not label me as lazy or unmotivated.',
      }),
    ).toMatchObject({ kind: 'reject', nextStatus: 'rejected' });
  });

  it('asks for clarification when the full source explicitly marks a detail as uncertain', () => {
    expect(
      decideMemoryCandidate({
        memoryType: 'fact',
        canonicalStatement: 'The Signals tutorial is this week.',
        confidence: 1,
        evidenceCount: 1,
        isExplicit: true,
        isSensitiveInference: false,
        sourceText: 'I am not certain whether the Signals tutorial is this week or next week.',
      }),
    ).toMatchObject({ kind: 'clarify', nextStatus: 'candidate' });
  });

  it('only permits auditable lifecycle transitions', () => {
    expect(canTransitionMemory('active', 'soft_expired')).toBe(true);
    expect(canTransitionMemory('deleted', 'active')).toBe(false);
  });
});
