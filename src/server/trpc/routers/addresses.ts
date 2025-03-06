import { createInsertSchema } from 'drizzle-zod';
import { addresses, receivers } from 'src/db/schema';
import { updateAddressSchema } from 'src/schemas/address';
import { positiveIntSchema } from 'src/schemas/shared/numbers';
import { createAddress } from 'src/server/use-cases/address/create-address';
import { createAddressWithoutUser } from 'src/server/use-cases/address/create-address-without-user';
import { deleteAddress } from 'src/server/use-cases/address/delete-address';
import { getAddressesByUserId } from 'src/server/use-cases/address/get-addresses-by-user-id';
import { setAsDefaultAddress } from 'src/server/use-cases/address/set-as-default-address';
import { updateAddress } from 'src/server/use-cases/address/update-address';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const addressRouter = router({
  createAddress: protectedProcedure
    .input(createInsertSchema(addresses).merge(createInsertSchema(receivers)))
    .mutation(
      async ({
        ctx: {
          user: { id },
        },
        input,
      }) => await createAddress(id, input),
    ),

  createAddressWithoutUser: protectedProcedure
    .input(createInsertSchema(addresses).merge(createInsertSchema(receivers)))
    .mutation(async ({ input }) => await createAddressWithoutUser(input)),

  getByUserId: protectedProcedure
    .input(
      z.object({
        page: positiveIntSchema,
        pageSize: positiveIntSchema,
      }),
    )
    .query(
      async ({
        ctx: {
          user: { id },
        },
        input: { page, pageSize },
      }) => await getAddressesByUserId(id, page, pageSize),
    ),

  setAsDefault: protectedProcedure
    .input(
      z.object({
        addressId: positiveIntSchema,
        receiverId: positiveIntSchema,
      }),
    )
    .mutation(
      async ({
        ctx: {
          user: { id },
        },
        input: { addressId, receiverId },
      }) => await setAsDefaultAddress(id, addressId, receiverId),
    ),

  updateAddress: protectedProcedure.input(updateAddressSchema).mutation(
    async ({
      ctx: {
        user: { id },
      },
      input,
    }) => await updateAddress(id, input),
  ),

  deleteAddress: protectedProcedure
    .input(
      z.object({
        addressId: positiveIntSchema,
        receiverId: positiveIntSchema,
      }),
    )
    .mutation(
      async ({
        ctx: {
          user: { id },
        },
        input: { addressId, receiverId },
      }) => await deleteAddress(id, addressId, receiverId),
    ),
});
