import { SupabaseClient } from '@supabase/supabase-js';

export const exchangeCodeForSession = (
  supabase: SupabaseClient,
  { code }: { code: string },
) => supabase.auth.exchangeCodeForSession(code);
