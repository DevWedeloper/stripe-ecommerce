import { findOrCreateAddress } from 'src/db/data-access/address/find-or-create-address';
import { FindOrCreateAddressData } from 'src/db/types';

export const createAddress = async (
  userId: string,
  data: FindOrCreateAddressData,
) => findOrCreateAddress(userId, data);
