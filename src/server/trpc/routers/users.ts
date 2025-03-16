import { getAvatarPath } from 'src/server/use-cases/user/get-avatar-path';
import { updateAvatarPath } from 'src/server/use-cases/user/update-avatar-path';
import { createClient } from 'src/supabase/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const usersRouter = router({
  getAvatarPath: protectedProcedure.query(
    async ({
      ctx: {
        user: { id },
      },
    }) => await getAvatarPath(id),
  ),

  updateAvatarPath: protectedProcedure.input(z.string()).mutation(
    async ({
      ctx: {
        event,
        user: { id },
      },
      input,
    }) => await updateAvatarPath(createClient(event), id, input),
  ),

  deleteAvatarPath: protectedProcedure.mutation(
    async ({
      ctx: {
        event,
        user: { id },
      },
    }) => await updateAvatarPath(createClient(event), id, null),
  ),
});
