import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import { H3Event } from 'h3';
import { getEnvVar } from 'src/env';

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const createClient = (event: H3Event) => {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(event.node.req.headers.cookie ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.node.res.appendHeader(
            'Set-Cookie',
            serializeCookieHeader(name, value, options),
          );
        });
      },
    },
  });
};
