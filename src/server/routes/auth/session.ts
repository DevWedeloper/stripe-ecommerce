import {
  defineEventHandler,
  getQuery,
  getRequestHeaders,
  getRequestProtocol,
  sendRedirect,
} from 'h3';
import { createClient } from 'src/supabase/server';

export default defineEventHandler(async (event) => {
  const headers = getRequestHeaders(event);
  const query = getQuery(event);

  const code = query['code'] as string | undefined;
  const error = query['error'] as string | undefined;
  const errorCode = query['error_code'] as string | undefined;
  const errorDescription = query['error_description'] as string | undefined;

  const params = new URLSearchParams();

  if (error) params.set('error', error);
  if (errorCode) params.set('error_code', errorCode);
  if (errorDescription) params.set('error_description', errorDescription);

  const host = headers.host;
  const protocol = getRequestProtocol(event);
  const baseURL = `${protocol}://${host}`;

  if (code) {
    const supabase = createClient(event);

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Failed to exchange code for session:', error);
    }
  }

  return sendRedirect(event, `${baseURL}/?${params.toString()}`);
});
