import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createDevelopmentCorpus } from '@/corpus/development-corpus';

const outputPath = process.argv[2] ?? 'tmp/development-corpus-v1.jsonl';
const records = createDevelopmentCorpus().map((record) => ({
  id: record.id,
  expectedDecision: record.expectedDecision,
  ...record.transcript,
}));

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`);
console.info(JSON.stringify({ outputPath, records: records.length }, null, 2));
