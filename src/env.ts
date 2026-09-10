import { z } from 'zod';

const serverEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  LLM_PROVIDER: z.enum(['deterministic', 'sarvam']).default('deterministic'),
  EMBEDDING_PROVIDER: z.enum(['deterministic', 'openai']).default('deterministic'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  SARVAM_API: z.string().min(1).optional(),
  SARVAM_INPUT_TOKEN_COST_USD_PER_MILLION: z.coerce.number().nonnegative().optional(),
  SARVAM_OUTPUT_TOKEN_COST_USD_PER_MILLION: z.coerce.number().nonnegative().optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function getServerEnvironment(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}
