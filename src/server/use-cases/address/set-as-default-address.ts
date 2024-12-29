import { updateDefaultAddress } from 'src/db/data-access/address/update-default-address';

export const setAsDefaultAddress = async (
  userId: string,
  addressId: number,
  receiverId: number,
): Promise<void> => updateDefaultAddress(userId, addressId, receiverId);
