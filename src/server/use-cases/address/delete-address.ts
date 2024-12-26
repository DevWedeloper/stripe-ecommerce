import { deleteAddress as deleteAddressFromDb } from 'src/db/data-access/address/delete-address';

export const deleteAddress = async (
  userId: string,
  addressId: number,
  receiverId: number,
): Promise<void> => deleteAddressFromDb(userId, addressId, receiverId);
