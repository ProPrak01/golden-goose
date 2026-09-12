import { describe, expect, it } from 'vitest';
import { createMemoryProposal } from '@/server/ingestion/create-memory-proposal';

describe('memory proposals', () => {
  it('only accepts a confirmed explicit statement', () => {
    const proposal = createMemoryProposal({
      occurredAt: '2026-09-06T09:00:00.000Z',
      transcriptText: 'Controls assignment is due Friday.',
      memoryStatement: 'The Controls assignment is due Friday.',
      memoryType: 'fact',
      isExplicit: true,
    });

    expect(proposal.decision).toMatchObject({ kind: 'accept', nextStatus: 'active' });
    expect(proposal.input.sourceApp).toBe('Kivi');
  });
});
