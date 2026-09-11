import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { runResearchSuite } from '@/evaluation/research-suite';

const outputPath = resolve(process.cwd(), 'output/evaluation/research_suite_report.json');
const report = runResearchSuite();

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.info(
  JSON.stringify(
    {
      outputPath,
      summary: report.summary,
    },
    null,
    2,
  ),
);
