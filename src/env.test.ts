import { describe, expect, it } from 'vitest';
import { getServerEnvironment } from '@/env';

describe('getServerEnvironment', () => {
  it('defaults to the deterministic provider', () => {
    const environment = getServerEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    });
    expect(environment.LLM_PROVIDER).toBe('deterministic');
  });
});
