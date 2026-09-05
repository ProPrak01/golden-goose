import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnvironment } from '@/env';
import type { Database } from '@/generated/database.types';

let client: SupabaseClient<Database> | undefined;

export function getDatabaseClient(): SupabaseClient<Database> {
  if (client) return client;

  const environment = getServerEnvironment();
  client = createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  return client;
}
