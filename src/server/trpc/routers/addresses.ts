import { createInsertSchema } from 'drizzle-zod';
import { addresses, receivers } from 'src/db/schema';
import { positiveIntSchema } from 'src/schemas/zod-schemas';
import { createAddress } from 'src/server/use-cases/address/create-address';
import { createAddressWithoutUser } from 'src/server/use-cases/address/create-address-without-user';
import { deleteAddress } from 'src/server/use-cases/address/delete-address';
import { getAddressesByUserId } from 'src/server/use-cases/address/get-addresses-by-user-id';
import { setAsDefaultAddress } from 'src/server/use-cases/address/set-as-default-address';
import { updateAddress } from 'src/server/use-cases/address/update-address';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const addressRouter = router({
  createAddress: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        data: createInsertSchema(addresses).merge(
          createInsertSchema(receivers),
        ),
      }),
    )
    .mutation(
      async ({ input: { userId, data } }) => await createAddress(userId, data),
    ),

  createAddressWithoutUser: publicProcedure
    .input(createInsertSchema(addresses).merge(createInsertSchema(receivers)))
    .mutation(async ({ input }) => await createAddressWithoutUser(input)),

  getByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        page: positiveIntSchema,
        pageSize: positiveIntSchema,
      }),
    )
    .query(
      async ({ input: { userId, page, pageSize } }) =>
        await getAddressesByUserId(userId, page, pageSize),
    ),

  setAsDefault: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        addressId: positiveIntSchema,
        receiverId: positiveIntSchema,
      }),
    )
    .mutation(
      async ({ input: { userId, addressId, receiverId } }) =>
        await setAsDefaultAddress(userId, addressId, receiverId),
    ),

  updateAddress: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        addressId: positiveIntSchema,
        receiverId: positiveIntSchema,
        currentAddressData: createInsertSchema(addresses),
        currentReceiverData: createInsertSchema(receivers),
        newAddressData: createInsertSchema(addresses),
        newReceiverData: createInsertSchema(receivers),
      }),
    )
    .mutation(async ({ input }) => await updateAddress(input)),

  deleteAddress: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        addressId: positiveIntSchema,
        receiverId: positiveIntSchema,
      }),
    )
    .mutation(
      async ({ input: { userId, addressId, receiverId } }) =>
        await deleteAddress(userId, addressId, receiverId),
    ),
});
