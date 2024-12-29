import { updateAddress as updateAddressFromDb } from 'src/db/data-access/address/update-address';
import { updateAddressAndReceiver } from 'src/db/data-access/address/update-address-and-receiver';
import { updateReceiver } from 'src/db/data-access/address/update-receiver';
import { AddressReceiverLink, UpdateAddressData } from 'src/db/types';

export const updateAddress = async ({
  userId,
  addressId,
  receiverId,
  currentAddressData,
  currentReceiverData,
  newAddressData,
  newReceiverData,
}: UpdateAddressData): Promise<AddressReceiverLink> => {
  const isAddressChanged =
    JSON.stringify(currentAddressData) !== JSON.stringify(newAddressData);
  const isReceiverChanged =
    JSON.stringify(currentReceiverData) !== JSON.stringify(newReceiverData);

  if (isAddressChanged && isReceiverChanged) {
    await updateAddressAndReceiver(
      userId,
      addressId,
      receiverId,
      newAddressData,
      newReceiverData,
    );
  } else if (isAddressChanged) {
    await updateAddressFromDb(userId, addressId, receiverId, newAddressData);
  } else if (isReceiverChanged) {
    await updateReceiver(userId, addressId, receiverId, newReceiverData);
  } else {
    console.warn('Neither address nor receiver data has changed.');
  }

  return {
    addressId,
    receiverId,
    ...newAddressData,
    ...newReceiverData,
  };
};
