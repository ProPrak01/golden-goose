import { NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryControlInputSchema } from '@/schemas/memory-control';
import { controlMemory } from '@/server/memory/control-memory';

export async function PATCH(request: Request, context: { params: Promise<{ memoryId: string }> }) {
  try {
    const body: unknown = await request.json();
    const input = memoryControlInputSchema.parse(body);
    const { memoryId } = await context.params;
    const result = await controlMemory(memoryId, input);
    if (!result) return NextResponse.json({ error: 'Memory not found.' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid memory control request.', issues: error.issues },
        { status: 400 },
      );
    }
    throw error;
  }
}
