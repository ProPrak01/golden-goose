import { createRequire } from 'node:module';
import { runCorpusEvaluation } from '@/evaluation/corpus-evaluation';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');

loadEnvConfig(process.cwd());
console.info(JSON.stringify(await runCorpusEvaluation(), null, 2));
