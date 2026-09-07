import { describe, expect, it } from 'vitest';
import { createDevelopmentCorpus } from '@/corpus/development-corpus';

describe('development corpus', () => {
  it('creates a deterministic 500-record corpus across policy outcomes', () => {
    const corpus = createDevelopmentCorpus();
    expect(corpus).toHaveLength(500);
    expect(corpus.filter((record) => record.expectedDecision === 'accept')).toHaveLength(390);
    expect(corpus.filter((record) => record.expectedDecision === 'clarify')).toHaveLength(40);
    expect(corpus.filter((record) => record.expectedDecision === 'reject')).toHaveLength(70);
    expect(corpus.every((record) => record.transcript.rawAsr.length > 0)).toBe(true);
    expect(corpus.every((record) => record.transcript.formattedText.length > 0)).toBe(true);
  });
});
