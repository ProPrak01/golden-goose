import { describe, expect, it } from 'vitest';
import { composeAssistantResponse, planAssistantResponse } from '@/domain/assistant';

describe('assistant planning', () => {
  it('does not answer unsupported requests', () => {
    expect(
      planAssistantResponse('What should I do today?', {
        kind: 'abstain',
        candidates: [],
        rationale: 'No support.',
      }),
    ).toMatchObject({ outcome: 'abstained' });
  });

  it('names the supporting memory in a grounded answer', () => {
    const retrieval = {
      kind: 'selected' as const,
      rationale: 'Active evidence found.',
      candidates: [
        {
          id: 'deadline',
          statement: 'Controls assignment due Friday.',
          status: 'active' as const,
          confidence: 0.9,
          lexicalScore: 0.01,
          evidenceCount: 1,
        },
      ],
    };
    const plan = planAssistantResponse('What should I do today?', retrieval);

    expect(composeAssistantResponse(plan, retrieval)).toContain('Controls assignment due Friday.');
  });
});
