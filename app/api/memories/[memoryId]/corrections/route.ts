import { NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryCorrectionInputSchema } from '@/schemas/memory-correction';
import { correctMemory } from '@/server/memory/correct-memory';

export async function POST(request: Request, context: { params: Promise<{ memoryId: string }> }) {
  try {
    const body: unknown = await request.json();
    const input = memoryCorrectionInputSchema.parse(body);
    const { memoryId } = await context.params;
    const correction = await correctMemory(memoryId, input);
    if (!correction) return NextResponse.json({ error: 'Memory not found.' }, { status: 404 });
    return NextResponse.json(correction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid correction.', issues: error.issues },
        { status: 400 },
      );
    }
    throw error;
  }
}
