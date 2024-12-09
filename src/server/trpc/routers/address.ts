import { createInsertSchema } from 'drizzle-zod';
import { addresses } from 'src/db/schema';
import { createAddress } from 'src/server/use-cases/address/create-address';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const addressRouter = router({
  createAddress: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        data: createInsertSchema(addresses)
          .omit({ countryId: true })
          .merge(
            z.object({
              countryCode: z.string().refine((val) => val.length === 2, {
                message: `String must be exactly 2 characters long`,
              }),
            }),
          ),
      }),
    )
    .mutation(
      async ({ input: { userId, data } }) => await createAddress(userId, data),
    ),
});
