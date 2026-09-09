import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { memoryExtractionRequestSchema } from '@/schemas/memory-extraction-request';
import { createExtractionProposals } from '@/server/ingestion/create-extraction-proposals';
import { extractMemoriesWithSarvam } from '@/server/ingestion/sarvam-extractor';

export async function POST(request: Request) {
  try {
    const input = memoryExtractionRequestSchema.parse(await request.json());
    const modelRun = await extractMemoriesWithSarvam(input.transcriptText);
    return NextResponse.json({
      proposals: createExtractionProposals(input, modelRun.extraction),
      extractionReason: modelRun.extraction.reason,
      modelRun: {
        provider: modelRun.provider,
        model: modelRun.model,
        latencyMs: modelRun.latencyMs,
        inputTokens: modelRun.inputTokens,
        outputTokens: modelRun.outputTokens,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid extraction request.', issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error: 'Kivi could not extract memories right now. You can still review a manual proposal.',
      },
      { status: 502 },
    );
  }
}
