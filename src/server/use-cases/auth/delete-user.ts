import { SupabaseClient } from '@supabase/supabase-js';

export const deleteUser = (supabase: SupabaseClient, { id }: { id: string }) =>
  supabase.auth.admin.deleteUser(id);
