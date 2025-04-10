import { createAddressSchema, updateAddressSchema } from 'src/schemas/address';
import { paginationSchema } from 'src/schemas/pagination';
import { positiveIntSchema } from 'src/schemas/shared/numbers';
import { createAddress } from 'src/server/use-cases/address/create-address';
import { createAddressWithoutUser } from 'src/server/use-cases/address/create-address-without-user';
import { deleteAddress } from 'src/server/use-cases/address/delete-address';
import { getAddressesByUserId } from 'src/server/use-cases/address/get-addresses-by-user-id';
import { setAsDefaultAddress } from 'src/server/use-cases/address/set-as-default-address';
import { updateAddress } from 'src/server/use-cases/address/update-address';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const addressRouter = router({
  createAddress: protectedProcedure.input(createAddressSchema).mutation(
    async ({
      ctx: {
        user: { id },
      },
      input,
    }) => await createAddress(id, input),
  ),

  createAddressWithoutUser: publicProcedure
    .input(createAddressSchema)
    .mutation(async ({ input }) => await createAddressWithoutUser(input)),

  getByUserId: protectedProcedure.input(z.object(paginationSchema)).query(
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
