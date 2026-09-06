import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createMemoryProposal } from '@/server/ingestion/create-memory-proposal';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    return NextResponse.json(createMemoryProposal(body));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid memory proposal.', issues: error.issues },
        { status: 400 },
      );
    }
    throw error;
  }
}
