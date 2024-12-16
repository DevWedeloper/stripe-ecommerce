import { SupabaseClient } from '@supabase/supabase-js';

export const updateEmail = (
  supabase: SupabaseClient,
  { email }: { email: string },
) => supabase.auth.updateUser({ email });
