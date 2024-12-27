import { getPaginatedAddressesByUserId } from 'src/db/data-access/address/get-paginated-addresses-by-user-id';
import { PaginatedAddressesAndReceivers } from '../types/paginated';

export const getAddressesByUserId = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedAddressesAndReceivers> => {
  const offset = (page - 1) * pageSize;

  const { addresses, totalAddresses } = await getPaginatedAddressesByUserId(
    userId,
    offset,
    pageSize,
  );

  const totalPages = Math.ceil(totalAddresses / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    totalAddresses,
    addresses,
  };
};
