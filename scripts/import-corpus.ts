import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { transcriptInputSchema } from '@/schemas/transcript';
import { extractMemoriesWithSarvam } from '@/server/ingestion/sarvam-extractor';
import { processTranscriptCandidates } from '@/server/ingestion/process-transcript';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd());

const inputPath = process.argv[2];
const subjectKey = process.argv[3];
if (!inputPath) {
  throw new Error('Usage: bun run corpus:import:file -- path/to/corpus.jsonl [subject-key]');
}

const lines = (await readFile(inputPath, 'utf8')).split('\n').filter((line) => line.trim());
const summary = { records: lines.length, candidates: 0, created: 0, clarified: 0, rejected: 0 };

for (const line of lines) {
  const transcript = transcriptInputSchema.parse(JSON.parse(line));
  const modelRun = await extractMemoriesWithSarvam(transcript.formattedText);
  const result = await processTranscriptCandidates({
    transcript,
    candidates: modelRun.extraction.candidates.map((candidate) => ({
      candidate: { ...candidate, evidenceCount: 1 },
      excerpt: candidate.excerpt,
    })),
    ...(subjectKey === undefined ? {} : { subjectKey }),
    emptyReason: 'Sarvam extraction produced no explicit memory candidates.',
    modelRun,
  });
  summary.candidates += result.results.length;
  for (const decisionResult of result.results) {
    if (decisionResult.decision.kind === 'accept') summary.created += 1;
    if (decisionResult.decision.kind === 'clarify') summary.clarified += 1;
    if (decisionResult.decision.kind === 'reject') summary.rejected += 1;
  }
  if (result.results.length === 0) summary.rejected += 1;
}
console.info(JSON.stringify(summary, null, 2));
