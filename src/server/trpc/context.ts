import { inferAsyncReturnType } from '@trpc/server';
import { H3Event } from 'h3';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (event: H3Event) => ({
  event,
});
export type Context = inferAsyncReturnType<typeof createContext>;
