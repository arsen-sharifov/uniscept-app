import { vi } from 'vitest';

import { primeSupabase } from './supabase';

export const createClient = vi.fn();

export const primeServerClient = (...parameters: Parameters<typeof primeSupabase>) => {
  const { client } = primeSupabase(...parameters);
  vi.mocked(createClient).mockResolvedValue(client as never);

  return client;
};
