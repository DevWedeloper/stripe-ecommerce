import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import { getEnvVar } from 'src/env';

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const createClient = () =>
  supabaseCreateClient(SUPABASE_URL, SUPABASE_ANON_KEY);
