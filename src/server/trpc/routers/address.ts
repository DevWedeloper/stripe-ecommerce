import { createInsertSchema } from 'drizzle-zod';
import { addresses, receivers } from 'src/db/schema';
import { positiveIntSchema } from 'src/schemas/zod-schemas';
import { createAddress } from 'src/server/use-cases/address/create-address';
import { getAddressesByUserId } from 'src/server/use-cases/address/get-addresses-by-user-id';
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
          )
          .merge(createInsertSchema(receivers)),
      }),
    )
    .mutation(
      async ({ input: { userId, data } }) => await createAddress(userId, data),
    ),

  getByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        page: positiveIntSchema,
        pageSize: positiveIntSchema,
      }),
    )
    .query(async ({ input: { userId } }) => await getAddressesByUserId(userId)),
});
