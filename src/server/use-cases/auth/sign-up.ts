import { SupabaseClient } from '@supabase/supabase-js';

export const signUp = (
  supabase: SupabaseClient,
  { email, password }: { email: string; password: string },
) => supabase.auth.signUp({ email, password });
