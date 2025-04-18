import { SupabaseClient } from '@supabase/supabase-js';

export const signUp = (
  supabase: SupabaseClient,
  {
    email,
    password,
    redirectTo,
  }: { email: string; password: string; redirectTo: string },
) =>
  supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${redirectTo}/api/auth/session` },
  });
