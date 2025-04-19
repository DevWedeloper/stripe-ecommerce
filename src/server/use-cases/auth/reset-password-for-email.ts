import { SupabaseClient } from '@supabase/supabase-js';

export const resetPasswordForEmail = (
  supabase: SupabaseClient,
  { email, url }: { email: string; url: string },
) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${url}/api/auth/session?next=reset-password`,
  });
