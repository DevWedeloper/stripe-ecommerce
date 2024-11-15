import {
  CookieOptions,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import { H3Event } from 'h3';
import { getEnvVar } from 'src/env';

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

const cookieHandler = (event: H3Event) => ({
  getAll() {
    return parseCookieHeader(event.node.req.headers.cookie ?? '');
  },
  setAll(
    cookiesToSet: {
      name: string;
      value: string;
      options: CookieOptions;
    }[],
  ) {
    cookiesToSet.forEach(({ name, value, options }) => {
      event.node.res.appendHeader(
        'Set-Cookie',
        serializeCookieHeader(name, value, options),
      );
    });
  },
});

export const createClient = (event: H3Event) => {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: cookieHandler(event),
  });
};

export const createAdminClient = (event: H3Event) => {
  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: cookieHandler(event),
  });
};
