import { createAddress as insertAddress } from 'src/db/data-access/address/create-address';
import { AddressInsertWithCountryCode } from 'src/db/types';

export const createAddress = async (
  data: AddressInsertWithCountryCode,
): Promise<{
  id: number;
}> => insertAddress(data);
