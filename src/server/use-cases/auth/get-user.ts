import { SupabaseClient } from '@supabase/supabase-js';

export const getUser = (supabase: SupabaseClient) => supabase.auth.getUser();
