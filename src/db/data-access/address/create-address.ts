import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { addresses, countries } from 'src/db/schema';
import { AddressInsertWithCountryCode } from 'src/db/types';

export const createAddress = async (
  data: AddressInsertWithCountryCode,
): Promise<{
  id: number;
}> => {
  const countryIdQuery = db.$with('country_id').as(
    db
      .select({
        id: countries.id,
      })
      .from(countries)
      .where(eq(countries.code, data.countryCode)),
  );

  const [address] = await db
    .with(countryIdQuery)
    .insert(addresses)
    .values({
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      countryId: Number(countryIdQuery.id),
    })
    .returning({ id: addresses.id });

  return address;
};
