import { describe, expect, it } from 'vitest';
import { createExtractionProposals } from '@/server/ingestion/create-extraction-proposals';

describe('extraction proposals', () => {
  it('turns explicit provider output into review-only proposals', () => {
    const proposals = createExtractionProposals(
      {
        occurredAt: '2026-09-09T09:00:00.000Z',
        sourceApp: 'Kivi',
        transcriptText: 'My Signals quiz is due Friday.',
      },
      {
        candidates: [
          {
            memoryType: 'fact',
            canonicalStatement: 'The Signals quiz is due Friday.',
            excerpt: 'My Signals quiz is due Friday.',
            confidence: 0.91,
            isExplicit: true,
            isSensitiveInference: false,
          },
        ],
        reason: 'Explicit deadline.',
      },
    );

    expect(proposals).toHaveLength(1);
    expect(proposals[0]).toMatchObject({
      excerpt: 'My Signals quiz is due Friday.',
      input: { memoryStatement: 'The Signals quiz is due Friday.' },
      decision: { kind: 'accept' },
    });
  });

  it('keeps an inferred trait rejected instead of creating a durable proposal', () => {
    const proposals = createExtractionProposals(
      {
        occurredAt: '2026-09-09T09:00:00.000Z',
        sourceApp: 'Kivi',
        transcriptText: 'I missed the deadline.',
      },
      {
        candidates: [
          {
            memoryType: 'pattern',
            canonicalStatement: 'The user is lazy.',
            excerpt: 'I missed the deadline.',
            confidence: 0.95,
            isExplicit: false,
            isSensitiveInference: true,
          },
        ],
        reason: 'Unsafe inference.',
      },
    );

    expect(proposals[0]).toMatchObject({ decision: { kind: 'reject' } });
  });
});
