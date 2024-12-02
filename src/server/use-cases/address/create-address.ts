import { createAddress as insertAddress } from 'src/db/data-access/address/create-address';
import { AddressInsert } from 'src/db/schema';

export const createAddress = async (
  data: AddressInsert,
): Promise<{
  id: number;
}> => insertAddress(data);
