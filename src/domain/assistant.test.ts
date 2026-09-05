import { describe, expect, it } from 'vitest';
import { planAssistantResponse } from '@/domain/assistant';

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
});
