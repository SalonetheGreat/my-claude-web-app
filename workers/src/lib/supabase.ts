import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types';

export function createSupabaseClient(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}
