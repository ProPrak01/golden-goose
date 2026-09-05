import { z } from 'zod';

export const heyKiviRequestSchema = z.object({
  request: z.string().trim().min(1).max(500),
});

export type HeyKiviRequest = z.infer<typeof heyKiviRequestSchema>;
