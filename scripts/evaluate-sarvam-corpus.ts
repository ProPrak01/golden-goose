import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { runProviderExtractionEvaluation } from '@/evaluation/provider-extraction-evaluation';
import { transcriptInputSchema } from '@/schemas/transcript';
import { extractMemoriesWithSarvam } from '@/server/ingestion/sarvam-extractor';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd());

const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: bun run eval:sarvam -- path/to/corpus.jsonl');

const recordSchema = z.object({
  id: z.string().trim().min(1).optional(),
  expectedDecision: z.enum(['accept', 'clarify', 'reject']).optional(),
  occurredAt: z.string(),
  sourceApp: z.string().optional(),
  rawAsr: z.string(),
  formattedText: z.string(),
  context: z.record(z.string(), z.unknown()).default({}),
});

const lines = (await readFile(inputPath, 'utf8')).split('\n').filter((line) => line.trim());
const records = lines.map((line, index) => {
  const raw = recordSchema.parse(JSON.parse(line));
  const contextExpectedDecision = raw.context['expectedDecision'];
  const expectedDecision =
    raw.expectedDecision ??
    (contextExpectedDecision === 'accept' ||
    contextExpectedDecision === 'clarify' ||
    contextExpectedDecision === 'reject'
      ? contextExpectedDecision
      : undefined);
  return {
    id: raw.id ?? `record-${index + 1}`,
    transcript: transcriptInputSchema.parse(raw),
    ...(expectedDecision === undefined ? {} : { expectedDecision }),
  };
});

console.info(
  JSON.stringify(
    await runProviderExtractionEvaluation(records, extractMemoriesWithSarvam),
    null,
    2,
  ),
);
