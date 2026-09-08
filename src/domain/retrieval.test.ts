import { describe, expect, it } from 'vitest';
import { scoreLexicalRelevance, selectGroundedMemories } from '@/domain/retrieval';

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

  it('keeps broad planning requests grounded in evidenced active memory', () => {
    expect(
      scoreLexicalRelevance('What should I do today?', 'Controls assignment due Friday.'),
    ).toBe(0.01);
  });

  it('does not mix generic planning fallbacks into a specific topic result', () => {
    const result = selectGroundedMemories([
      {
        id: 'signals-deadline',
        statement: 'Signals quiz due Friday.',
        status: 'active',
        confidence: 0.9,
        lexicalScore: 0.6,
        evidenceCount: 1,
      },
      {
        id: 'unrelated-planning',
        statement: 'Controls assignment due Friday.',
        status: 'active',
        confidence: 0.9,
        lexicalScore: 0.01,
        evidenceCount: 1,
      },
    ]);

    expect(result).toMatchObject({ kind: 'selected' });
    if (result.kind === 'selected') {
      expect(result.candidates.map((candidate) => candidate.id)).toEqual(['signals-deadline']);
    }
  });

  it('deduplicates repeated canonical statements before composing an answer', () => {
    const result = selectGroundedMemories([
      {
        id: 'first',
        statement: 'Signals quiz due Friday.',
        status: 'active',
        confidence: 0.9,
        lexicalScore: 0.8,
        evidenceCount: 1,
      },
      {
        id: 'second',
        statement: 'Signals quiz due Friday.',
        status: 'active',
        confidence: 0.9,
        lexicalScore: 0.7,
        evidenceCount: 1,
      },
    ]);

    expect(result).toMatchObject({ kind: 'selected' });
    if (result.kind === 'selected') expect(result.candidates).toHaveLength(1);
  });

  it('does not manufacture relevance for an unrelated factual question', () => {
    expect(
      scoreLexicalRelevance('What is my home address?', 'Controls assignment due Friday.'),
    ).toBe(0);
  });

  it('does not treat generic deadline language as a memory match', () => {
    expect(
      scoreLexicalRelevance(
        'When is the planetary report due?',
        'The Controls assignment is due Friday.',
      ),
    ).toBe(0);
  });

  it('allows a supported semantic match when lexical terms do not overlap', () => {
    const result = selectGroundedMemories([
      {
        id: 'semantic',
        statement: 'The Controls assignment is due Friday.',
        status: 'active',
        confidence: 0.9,
        lexicalScore: 0,
        semanticScore: 0.82,
        evidenceCount: 1,
      },
    ]);

    expect(result).toMatchObject({ kind: 'selected' });
  });

  it('still excludes a stale memory with a high semantic score', () => {
    expect(
      selectGroundedMemories([
        {
          id: 'stale-semantic',
          statement: 'Old deadline.',
          status: 'soft_expired',
          confidence: 0.99,
          lexicalScore: 0,
          semanticScore: 0.99,
          evidenceCount: 1,
        },
      ]),
    ).toMatchObject({ kind: 'abstain' });
  });
});
