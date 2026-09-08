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

  it('connects multiple explicit memories without inventing a personal trait', () => {
    const retrieval = {
      kind: 'selected' as const,
      rationale: 'Active evidence found.',
      candidates: [
        {
          id: 'deadline',
          statement: 'The Signals quiz is Friday.',
          status: 'active' as const,
          confidence: 0.95,
          lexicalScore: 1,
          evidenceCount: 1,
        },
        {
          id: 'episode',
          statement:
            'The user explicitly reported rushing Signals revision after starting the night before.',
          status: 'active' as const,
          confidence: 0.9,
          lexicalScore: 0.8,
          evidenceCount: 1,
        },
        {
          id: 'preference',
          statement:
            'The user explicitly prefers two focused study blocks before a Signals assessment.',
          status: 'active' as const,
          confidence: 0.9,
          lexicalScore: 0.8,
          evidenceCount: 1,
        },
      ],
    };
    const plan = planAssistantResponse('What should I do for Signals this week?', retrieval);
    const response = composeAssistantResponse(plan, retrieval);

    expect(response).toContain('3 related explicit memories');
    expect(response).toContain('focused study blocks');
    expect(response).not.toContain('lazy');
  });
});
