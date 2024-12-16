import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import { FindOrCreateAddressData } from 'src/db/types';

export const findOrCreateAddress = async (
  userId: string,
  data: FindOrCreateAddressData,
): Promise<void> => {
  const query = sql`
    with country_id as (
      select id
      from countries
      where code = ${data.countryCode}
    ),

    created_address as (
      insert into addresses (address_line1, address_line2, city, state, postal_code, country_id)
      select ${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.postalCode}, c.id
      from country_id c
      on conflict (address_line1, address_line2, city, state, postal_code, country_id) do nothing
      returning id
    ),

    address_id as (
      select id from created_address

      union

      select a.id
      from addresses a
      join country_id c on a.country_id = c.id 
      where address_line1 = ${data.addressLine1}
        and address_line2 = ${data.addressLine2}
        and city = ${data.city}
        and state = ${data.state}
        and postal_code = ${data.postalCode}
    )

    insert into user_addresses (user_id, address_id)
    select ${userId}, id
    from address_id
  `;

  await db.execute(query);
};
