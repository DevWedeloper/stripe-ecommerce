import { SupabaseClient } from '@supabase/supabase-js';

export const signInWithPassword = (
  supabase: SupabaseClient,
  { email, password }: { email: string; password: string },
) => supabase.auth.signInWithPassword({ email, password });
