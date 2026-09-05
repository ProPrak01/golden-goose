import { NextResponse } from 'next/server';
import { listActiveMemories } from '@/server/memory/list-memories';

export async function GET() {
  return NextResponse.json({ memories: await listActiveMemories() });
}
