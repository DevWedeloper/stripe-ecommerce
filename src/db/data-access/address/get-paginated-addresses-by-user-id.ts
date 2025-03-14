import { desc, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { addresses, countries, receivers, userAddresses } from 'src/db/schema';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedAddressesByUserId = async (
  userId: string,
  offset: number,
  pageSize: number,
) => {
  const query = db
    .select({
      isDefault: userAddresses.isDefault,
      addressId: addresses.id,
      addressLine1: addresses.addressLine1,
      addressLine2: addresses.addressLine2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      countryId: countries.id,
      receiverId: receivers.id,
      fullName: receivers.fullName,
      totalCount: totalCount,
    })
    .from(userAddresses)
    .innerJoin(addresses, eq(addresses.id, userAddresses.addressId))
    .innerJoin(receivers, eq(receivers.id, userAddresses.receiverId))
    .innerJoin(countries, eq(countries.id, addresses.countryId))
    .where(eq(userAddresses.userId, userId))
    .orderBy(desc(userAddresses.isDefault))
    .offset(offset)
    .limit(pageSize);

  const result = await query;

  const { data, totalCount: totalAddresses } = formatPaginatedResult(result);

  return {
    addresses: data,
    totalAddresses,
  };
};
