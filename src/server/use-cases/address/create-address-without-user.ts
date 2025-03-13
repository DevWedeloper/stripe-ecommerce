import { findOrCreateAddressWithoutUser } from 'src/db/data-access/address/find-or-create-address-without-user';
import { CreateAddressSchema } from 'src/schemas/address';

export const createAddressWithoutUser = async (data: CreateAddressSchema) =>
  findOrCreateAddressWithoutUser(data);
