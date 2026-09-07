import type { MemoryCandidate } from '@/domain/memory';
import type { TranscriptInput } from '@/schemas/transcript';
import { developmentCorpusSourceApp, developmentCorpusSubjectKey } from '@/server/memory/scopes';

export type DevelopmentCorpusRecord = {
  id: string;
  transcript: TranscriptInput;
  candidate: MemoryCandidate;
  excerpt: string;
  expectedDecision: 'accept' | 'clarify' | 'reject';
  subjectKey: typeof developmentCorpusSubjectKey;
};

const courses = [
  'Algorithms',
  'Data Systems',
  'Signals',
  'Networks',
  'Machine Learning',
  'Distributed Systems',
  'Human Computer Interaction',
  'Operating Systems',
  'Linear Algebra',
  'Software Engineering',
] as const;

const deliverables = [
  'problem set',
  'lab report',
  'reading response',
  'design review',
  'quiz preparation',
] as const;

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

function occurredAt(index: number) {
  return new Date(
    Date.UTC(2026, 7, 3 + Math.floor(index / 4), 8 + (index % 8), 15, 0),
  ).toISOString();
}

function cycle<T>(values: readonly T[], index: number): T {
  const value = values[index % values.length];
  if (value === undefined) throw new Error('A corpus value was unexpectedly unavailable.');
  return value;
}

function record(input: Omit<DevelopmentCorpusRecord, 'subjectKey'>): DevelopmentCorpusRecord {
  return {
    ...input,
    transcript: {
      ...input.transcript,
      context: { ...input.transcript.context, expectedDecision: input.expectedDecision },
    },
    subjectKey: developmentCorpusSubjectKey,
  };
}

/**
 * A versioned, deterministic 500-record corpus. It includes realistic ASR
 * variations, formatted text, source metadata, and known policy outcomes.
 */
export function createDevelopmentCorpus(): DevelopmentCorpusRecord[] {
  const records: DevelopmentCorpusRecord[] = [];

  for (let index = 0; index < 250; index += 1) {
    const course = cycle(courses, index);
    const deliverable = cycle(deliverables, index);
    const weekday = cycle(weekdays, index);
    const formattedText = `My ${course} ${deliverable} is due ${weekday}.`;
    records.push(
      record({
        id: `explicit-deadline-${index + 1}`,
        transcript: {
          occurredAt: occurredAt(index),
          sourceApp: developmentCorpusSourceApp,
          rawAsr: `my ${course.toLowerCase()} ${deliverable} is due ${weekday.toLowerCase()}`,
          formattedText,
          context: { corpus: developmentCorpusSubjectKey, category: 'explicit-deadline', index },
        },
        candidate: {
          memoryType: 'fact',
          canonicalStatement: `The ${course} ${deliverable} is due ${weekday}.`,
          confidence: 0.94,
          evidenceCount: 1,
          isExplicit: true,
          isSensitiveInference: false,
        },
        excerpt: formattedText,
        expectedDecision: 'accept',
      }),
    );
  }

  for (let index = 0; index < 80; index += 1) {
    const course = cycle(courses, index);
    const formattedText = `For ${course}, I prefer to reserve two focused study blocks before an assessment.`;
    records.push(
      record({
        id: `explicit-preference-${index + 1}`,
        transcript: {
          occurredAt: occurredAt(250 + index),
          sourceApp: developmentCorpusSourceApp,
          rawAsr: `for ${course.toLowerCase()} i prefer two focused study blocks before assessment`,
          formattedText,
          context: { corpus: developmentCorpusSubjectKey, category: 'explicit-preference', index },
        },
        candidate: {
          memoryType: 'preference',
          canonicalStatement: `The user explicitly prefers two focused study blocks before a ${course} assessment.`,
          confidence: 0.9,
          evidenceCount: 1,
          isExplicit: true,
          isSensitiveInference: false,
        },
        excerpt: formattedText,
        expectedDecision: 'accept',
      }),
    );
  }

  for (let index = 0; index < 60; index += 1) {
    const course = cycle(courses, index);
    const formattedText = `For the last ${course} quiz, I rushed the final revision because I started the night before.`;
    records.push(
      record({
        id: `explicit-episode-${index + 1}`,
        transcript: {
          occurredAt: occurredAt(330 + index),
          sourceApp: developmentCorpusSourceApp,
          rawAsr: `last ${course.toLowerCase()} quiz i rushed final revision started night before`,
          formattedText,
          context: { corpus: developmentCorpusSubjectKey, category: 'explicit-episode', index },
        },
        candidate: {
          memoryType: 'episode',
          canonicalStatement: `The user explicitly reported rushing final revision for a ${course} quiz after starting the night before.`,
          confidence: 0.86,
          evidenceCount: 1,
          isExplicit: true,
          isSensitiveInference: false,
        },
        excerpt: formattedText,
        expectedDecision: 'accept',
      }),
    );
  }

  for (let index = 0; index < 40; index += 1) {
    const course = cycle(courses, index);
    const formattedText = `I am not certain whether the ${course} tutorial is this week or next week.`;
    records.push(
      record({
        id: `uncertain-detail-${index + 1}`,
        transcript: {
          occurredAt: occurredAt(390 + index),
          sourceApp: developmentCorpusSourceApp,
          rawAsr: `not sure ${course.toLowerCase()} tutorial this week or next`,
          formattedText,
          context: { corpus: developmentCorpusSubjectKey, category: 'uncertain-detail', index },
        },
        candidate: {
          memoryType: 'fact',
          canonicalStatement: `The ${course} tutorial is this week.`,
          confidence: 0.55,
          evidenceCount: 1,
          isExplicit: true,
          isSensitiveInference: false,
        },
        excerpt: formattedText,
        expectedDecision: 'clarify',
      }),
    );
  }

  for (let index = 0; index < 70; index += 1) {
    const course = cycle(courses, index);
    const formattedText = `I missed one ${course} deadline, so do not label me as lazy or unmotivated.`;
    records.push(
      record({
        id: `inferred-trait-${index + 1}`,
        transcript: {
          occurredAt: occurredAt(430 + index),
          sourceApp: developmentCorpusSourceApp,
          rawAsr: `missed one ${course.toLowerCase()} deadline dont call me lazy`,
          formattedText,
          context: { corpus: developmentCorpusSubjectKey, category: 'inferred-trait', index },
        },
        candidate: {
          memoryType: 'pattern',
          canonicalStatement: `The user is lazy with ${course}.`,
          confidence: 0.95,
          evidenceCount: 1,
          isExplicit: false,
          isSensitiveInference: true,
        },
        excerpt: formattedText,
        expectedDecision: 'reject',
      }),
    );
  }

  if (records.length !== 500)
    throw new Error(`Expected 500 corpus records, found ${records.length}.`);
  return records;
}
