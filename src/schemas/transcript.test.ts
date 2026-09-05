import { describe, expect, it } from 'vitest';
import { transcriptInputSchema } from '@/schemas/transcript';

describe('transcript input', () => {
  it('validates a replayable transcript record', () => {
    expect(
      transcriptInputSchema.parse({
        occurredAt: '2026-09-11T10:00:00.000Z',
        sourceApp: 'Slack',
        rawAsr: 'quiz friday',
        formattedText: 'Quiz Friday.',
        context: { course: 'Controls' },
      }),
    ).toMatchObject({ sourceApp: 'Slack' });
  });

  it('rejects a transcript without evidence text', () => {
    expect(() =>
      transcriptInputSchema.parse({
        occurredAt: '2026-09-11T10:00:00.000Z',
        rawAsr: '',
        formattedText: '',
      }),
    ).toThrow();
  });
});
