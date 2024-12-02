import { createInsertSchema } from 'drizzle-zod';
import { addresses } from 'src/db/schema';
import { createAddress } from 'src/server/use-cases/address/create-address';
import { publicProcedure, router } from '../trpc';

export const addressRouter = router({
  createAddress: publicProcedure
    .input(createInsertSchema(addresses))
    .mutation(async ({ input }) => await createAddress(input)),
});
