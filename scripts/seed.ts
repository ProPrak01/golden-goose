import { createRequire } from 'node:module';
import { processTranscript } from '@/server/ingestion/process-transcript';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');

loadEnvConfig(process.cwd());

const seedCases = [
  {
    transcript: {
      occurredAt: '2026-09-05T09:00:00.000Z',
      sourceApp: 'Kivi',
      rawAsr: 'Controls assignment is due Friday.',
      formattedText: 'Controls assignment is due Friday.',
      context: { fixture: 'deadline' },
    },
    candidate: {
      memoryType: 'fact' as const,
      canonicalStatement: 'The Controls assignment is due Friday.',
      confidence: 0.94,
      evidenceCount: 1,
      isExplicit: true,
      isSensitiveInference: false,
    },
    excerpt: 'Controls assignment is due Friday.',
  },
  {
    transcript: {
      occurredAt: '2026-09-05T09:05:00.000Z',
      sourceApp: 'Kivi',
      rawAsr: 'I am lazy with assignments.',
      formattedText: 'I am lazy with assignments.',
      context: { fixture: 'rejected-inference' },
    },
    candidate: {
      memoryType: 'pattern' as const,
      canonicalStatement: 'The user is lazy with assignments.',
      confidence: 0.95,
      evidenceCount: 1,
      isExplicit: false,
      isSensitiveInference: true,
    },
    excerpt: 'I am lazy with assignments.',
  },
];

const results = await Promise.all(seedCases.map(processTranscript));
console.info(`Seeded ${results.length} transcript decisions.`);
