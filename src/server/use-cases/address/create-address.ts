import { findOrCreateAddress } from 'src/db/data-access/address/find-or-create-address';
import { CreateAddressSchema } from 'src/schemas/address';

export const createAddress = async (
  userId: string,
  data: CreateAddressSchema,
) => findOrCreateAddress(userId, data);
