import { isEqual } from 'lodash-es';
import { getAddress } from 'src/db/data-access/address/get-address';
import { updateAddress as updateAddressFromDb } from 'src/db/data-access/address/update-address';
import { updateAddressAndReceiver } from 'src/db/data-access/address/update-address-and-receiver';
import { updateReceiver } from 'src/db/data-access/address/update-receiver';
import { AddressSelect, ReceiverSelect } from 'src/db/schema';
import { UpdateAddressSchema } from 'src/schemas/address';

export const updateAddress = async (
  userId: string,
  modifiedData: UpdateAddressSchema,
) => {
  const { address: modifiedAddress, receiver: modifiedReceiver } = modifiedData;

  const currentData = await getAddress({
    userId,
    addressId: modifiedAddress.id,
    receiverId: modifiedReceiver.id,
  });

  if (!currentData) throw new Error('Address not found');

  const currentAddress: AddressSelect = {
    id: currentData.addressId,
    addressLine1: currentData.addressLine1,
    addressLine2: currentData.addressLine2,
    city: currentData.city,
    state: currentData.state,
    postalCode: currentData.postalCode,
    countryId: currentData.countryId,
  };

  const isAddressChanged = !isEqual(currentAddress, modifiedAddress);

  const currentReceiver: ReceiverSelect = {
    id: currentData.receiverId,
    fullName: currentData.fullName,
  };

  const isReceiverChanged = !isEqual(currentReceiver, modifiedReceiver);

  if (isAddressChanged && isReceiverChanged) {
    await updateAddressAndReceiver(
      userId,
      modifiedAddress.id,
      modifiedReceiver.id,
      modifiedAddress,
      modifiedReceiver,
    );
  } else if (isAddressChanged) {
    await updateAddressFromDb(
      userId,
      modifiedAddress.id,
      modifiedReceiver.id,
      modifiedAddress,
    );
  } else if (isReceiverChanged) {
    await updateReceiver(
      userId,
      modifiedAddress.id,
      modifiedReceiver.id,
      modifiedReceiver,
    );
  } else {
    console.warn('Neither address nor receiver data has changed.');
  }

  const { id: modifiedAddressId, ...modifiedAddressData } = modifiedAddress;
  const { id: modifiedReceiverId, ...modifiedReceiverData } = modifiedReceiver;

  return {
    addressId: modifiedAddressId,
    receiverId: modifiedReceiverId,
    ...modifiedAddressData,
    ...modifiedReceiverData,
  };
};
