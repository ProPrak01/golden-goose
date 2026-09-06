import { describe, expect, it } from 'vitest';
import { toPgVector } from '@/server/embeddings/provider';

describe('pgvector serialization', () => {
  it('serializes an embedding in the Postgres vector literal format', () => {
    expect(toPgVector([0.1, -0.2, 0])).toBe('[0.1,-0.2,0]');
  });
});
