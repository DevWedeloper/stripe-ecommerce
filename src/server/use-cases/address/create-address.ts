import { findOrCreateAddress } from 'src/db/data-access/address/find-or-create-address';
import { AddressAndReceiverInsert } from 'src/db/types';

export const createAddress = async (
  userId: string,
  data: AddressAndReceiverInsert,
) => findOrCreateAddress(userId, data);
