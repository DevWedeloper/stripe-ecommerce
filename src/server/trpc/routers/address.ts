import { createInsertSchema } from 'drizzle-zod';
import { addresses } from 'src/db/schema';
import { createAddress } from 'src/server/use-cases/address/create-address';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const addressRouter = router({
  createAddress: publicProcedure
    .input(
      createInsertSchema(addresses)
        .omit({ countryId: true })
        .merge(
          z.object({
            countryCode: z.string().refine((val) => val.length === length, {
              message: `String must be exactly ${length} characters long`,
            }),
          }),
        ),
    )
    .mutation(async ({ input }) => await createAddress(input)),
});
