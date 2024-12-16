import { SupabaseClient } from '@supabase/supabase-js';

export const updatePassword = (
  supabase: SupabaseClient,
  { password }: { password: string },
) => supabase.auth.updateUser({ password });
