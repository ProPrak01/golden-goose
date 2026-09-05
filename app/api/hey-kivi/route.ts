import { NextResponse } from 'next/server';
import { z } from 'zod';
import { heyKiviRequestSchema } from '@/schemas/hey-kivi';
import { runHeyKivi } from '@/server/assistant/run-hey-kivi';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = heyKiviRequestSchema.parse(body);
    return NextResponse.json(await runHeyKivi(input.request));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid Hey Kivi request.', issues: error.issues },
        { status: 400 },
      );
    }
    throw error;
  }
}
