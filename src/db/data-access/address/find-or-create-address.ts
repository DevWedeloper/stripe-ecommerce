import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import { AddressInsertWithCountryCode } from 'src/db/types';

export const findOrCreateAddress = async (
  userId: string,
  data: AddressInsertWithCountryCode,
): Promise<void> => {
  const query = sql`
    with country_id as (
      select id
      from countries
      where code = ${data.countryCode}
    ),

    created_address as (
      insert into addresses (addressLine1, addressLine2, city, state, postalCode, countryId)
      select (${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.postalCode}, c.id)
      from country_id c
      on conflict (addressLine1, addressLine2, city, state, postalCode, countryId) do nothing
      returning id
    ),

    address_id as (
      select id from created_address

      union

      select a.id
      from address a
      join country_id c on a.countryId = c.id 
      where addressLine1 = ${data.addressLine1}
        and addressLine2 = ${data.addressLine2}
        and city = ${data.city}
        and state = ${data.state}
        and postalCode = ${data.postalCode}
    )

    insert into user_addresses (userId, addressId)
    select ${userId}, id
    from address_id
  `;

  await db.execute(query);
};
