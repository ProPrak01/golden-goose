import OpenAI from 'openai';
import { getServerEnvironment } from '@/env';

const embeddingModel = 'text-embedding-3-small';

export type TextEmbedding = {
  vector: number[];
  provider: 'openai';
  model: typeof embeddingModel;
  inputTokens: number | null;
};

export async function createTextEmbedding(input: string): Promise<TextEmbedding | null> {
  const environment = getServerEnvironment();
  if (environment.EMBEDDING_PROVIDER !== 'openai' || !environment.OPENAI_API_KEY) return null;

  const client = new OpenAI({ apiKey: environment.OPENAI_API_KEY });
  const response = await client.embeddings.create({ input, model: embeddingModel });
  const embedding = response.data[0]?.embedding;
  if (!embedding) throw new Error('OpenAI did not return an embedding.');

  return {
    vector: embedding,
    provider: 'openai',
    model: embeddingModel,
    inputTokens: response.usage?.total_tokens ?? null,
  };
}

export function toPgVector(values: readonly number[]) {
  return `[${values.join(',')}]`;
}
