import { createSignedUploadUrl } from 'src/server/use-cases/storage/create-signed-upload-url';
import { createClient } from 'src/supabase/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const storageRouter = router({
  createSignedUploadUrl: publicProcedure
    .input(
      z.object({
        storageId: z.string(),
        path: z.string(),
        options: z
          .object({
            upsert: z.boolean(),
          })
          .optional(),
      }),
    )
    .mutation(
      async ({ input, ctx: { event } }) =>
        await createSignedUploadUrl(createClient(event), input),
    ),
});
