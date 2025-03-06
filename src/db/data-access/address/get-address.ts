import { and, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { addresses, countries, receivers, userAddresses } from 'src/db/schema';

export const getAddress = async ({
  userId,
  addressId,
  receiverId,
}: {
  userId: string;
  addressId: number;
  receiverId: number;
}) => {
  const [result] = await db
    .select({
      addressId: addresses.id,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      countryId: countries.id,
      receiverId: receivers.id,
      fullName: receivers.fullName,
    })
    .from(addresses)
    .innerJoin(userAddresses, eq(addresses.id, userAddresses.addressId))
    .innerJoin(receivers, eq(receivers.id, userAddresses.receiverId))
    .innerJoin(countries, eq(countries.id, addresses.countryId))
    .where(
      and(
        eq(userAddresses.userId, userId),
        eq(userAddresses.addressId, addressId),
        eq(userAddresses.receiverId, receiverId),
      ),
    );

  return result || null;
};
