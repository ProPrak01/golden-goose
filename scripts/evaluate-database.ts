import { createRequire } from 'node:module';
import { runDatabaseEvaluation } from '@/evaluation/database-evaluation';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');

loadEnvConfig(process.cwd());
console.info(JSON.stringify(await runDatabaseEvaluation(), null, 2));
