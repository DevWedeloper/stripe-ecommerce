import { SupabaseClient } from '@supabase/supabase-js';

export const signOut = (supabase: SupabaseClient) => supabase.auth.signOut();
