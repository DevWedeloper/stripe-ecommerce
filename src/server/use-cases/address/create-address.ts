import { findOrCreateAddress } from 'src/db/data-access/address/find-or-create-address';
import { AddressInsertWithCountryCode } from 'src/db/types';

export const createAddress = async (
  userId: string,
  data: AddressInsertWithCountryCode,
): Promise<void> => findOrCreateAddress(userId, data);
