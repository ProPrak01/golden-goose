import type { Json } from '@/generated/database.types';
import { transcriptInputSchema, type TranscriptInput } from '@/schemas/transcript';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';

function toJson(value: TranscriptInput['context']): Json {
  return value as Json;
}

export async function insertTranscript(input: TranscriptInput) {
  const transcript = transcriptInputSchema.parse(input);
  const { data, error } = await getDatabaseClient()
    .from('transcripts')
    .insert({
      occurred_at: transcript.occurredAt,
      source_app: transcript.sourceApp ?? null,
      raw_asr: transcript.rawAsr,
      formatted_text: transcript.formattedText,
      context: toJson(transcript.context),
    })
    .select()
    .single();

  if (error) throw new RepositoryError('insert transcript', error.message);
  return data;
}
