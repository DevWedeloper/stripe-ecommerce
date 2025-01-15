import { findOrCreateAddressWithoutUser } from 'src/db/data-access/address/find-or-create-address-without-user';
import { AddressAndReceiverInsert } from 'src/db/types';

export const createAddressWithoutUser = async (
  data: AddressAndReceiverInsert,
) => findOrCreateAddressWithoutUser(data);
