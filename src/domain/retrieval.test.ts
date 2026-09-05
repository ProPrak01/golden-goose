import { describe, expect, it } from 'vitest';
import { selectGroundedMemories } from '@/domain/retrieval';

describe('grounded retrieval', () => {
  it('excludes stale and unsupported memories', () => {
    const result = selectGroundedMemories([
      {
        id: 'active',
        statement: 'Assignment due Friday.',
        status: 'active',
        confidence: 0.9,
        lexicalScore: 0.8,
        evidenceCount: 1,
      },
      {
        id: 'stale',
        statement: 'Old deadline.',
        status: 'soft_expired',
        confidence: 0.99,
        lexicalScore: 1,
        evidenceCount: 2,
      },
      {
        id: 'weak',
        statement: 'Uncertain preference.',
        status: 'active',
        confidence: 0.6,
        lexicalScore: 0.9,
        evidenceCount: 1,
      },
    ]);
    expect(result).toMatchObject({ kind: 'selected' });
    if (result.kind === 'selected')
      expect(result.candidates.map((candidate) => candidate.id)).toEqual(['active']);
  });

  it('abstains when there is no grounded support', () => {
    expect(selectGroundedMemories([])).toMatchObject({ kind: 'abstain' });
  });
});
