import { initTRPC, TRPCError } from '@trpc/server';
import { createClient } from 'src/supabase/server';
import { SuperJSON } from 'superjson';
import { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
  async ({ ctx: { event }, next }) => {
    const supabase = createClient(event);

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be authenticated',
      });
    }

    return next({
      ctx: {
        user: data.user,
      },
    });
  },
);
