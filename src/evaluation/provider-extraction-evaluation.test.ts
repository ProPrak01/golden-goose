import { describe, expect, it } from 'vitest';
import { runProviderExtractionEvaluation } from '@/evaluation/provider-extraction-evaluation';

describe('provider extraction evaluation', () => {
  it('reports policy outcomes, evidence validity, and model usage', async () => {
    const report = await runProviderExtractionEvaluation(
      [
        {
          id: 'deadline',
          transcript: {
            occurredAt: '2026-09-11T09:00:00.000Z',
            rawAsr: 'signals quiz due friday',
            formattedText: 'My Signals quiz is due Friday.',
            context: {},
          },
          expectedDecision: 'accept',
        },
        {
          id: 'small-talk',
          transcript: {
            occurredAt: '2026-09-11T09:01:00.000Z',
            rawAsr: 'nice weather',
            formattedText: 'The weather is pleasant today.',
            context: {},
          },
          expectedDecision: 'reject',
        },
      ],
      async (text) => ({
        extraction:
          text === 'My Signals quiz is due Friday.'
            ? {
                candidates: [
                  {
                    memoryType: 'fact',
                    canonicalStatement: 'The Signals quiz is due Friday.',
                    excerpt: 'My Signals quiz is due Friday.',
                    confidence: 0.92,
                    isExplicit: true,
                    isSensitiveInference: false,
                  },
                ],
                reason: 'Explicit deadline.',
              }
            : { candidates: [], reason: 'No durable memory.' },
        provider: 'sarvam',
        model: 'sarvam-105b',
        latencyMs: 120,
        inputTokens: 20,
        outputTokens: 10,
        estimatedCostUsd: 0.001,
        rawProviderResponse: { choices: [] },
      }),
    );

    expect(report.summary).toMatchObject({
      records: 2,
      passRate: 1,
      acceptancePrecision: 1,
      acceptanceRecall: 1,
      invalidEvidenceCount: 0,
      totalCandidates: 1,
      inputTokens: 40,
      outputTokens: 20,
      estimatedCostUsd: 0.002,
    });
  });

  it('flags provider evidence that is not a source span', async () => {
    const report = await runProviderExtractionEvaluation(
      [
        {
          id: 'bad-evidence',
          transcript: {
            occurredAt: '2026-09-11T09:00:00.000Z',
            rawAsr: 'signals quiz due friday',
            formattedText: 'My Signals quiz is due Friday.',
            context: {},
          },
        },
      ],
      async () => ({
        extraction: {
          candidates: [
            {
              memoryType: 'fact',
              canonicalStatement: 'The Signals quiz is due Friday.',
              excerpt: 'The quiz is next month.',
              confidence: 0.92,
              isExplicit: true,
              isSensitiveInference: false,
            },
          ],
          reason: 'Bad source span.',
        },
        provider: 'sarvam',
        model: 'sarvam-105b',
        latencyMs: 120,
        inputTokens: null,
        outputTokens: null,
        estimatedCostUsd: null,
        rawProviderResponse: { choices: [] },
      }),
    );

    expect(report.summary.invalidEvidenceCount).toBe(1);
    expect(report.summary.passRate).toBeNull();
  });
});
