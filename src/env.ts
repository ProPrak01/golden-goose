import { z } from 'zod';

const serverEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  LLM_PROVIDER: z.enum(['deterministic', 'openai']).default('deterministic'),
  EMBEDDING_PROVIDER: z.enum(['deterministic', 'openai']).default('deterministic'),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function getServerEnvironment(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}
