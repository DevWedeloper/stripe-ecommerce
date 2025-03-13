import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import { CreateAddressSchema } from 'src/schemas/address';

type AddressAndReceiverResult = {
  addressId: number;
  receiverId: number;
};

export const findOrCreateAddressWithoutUser = async (
  data: CreateAddressSchema,
): Promise<AddressAndReceiverResult> => {
  const query = sql`
    with created_address as (
      insert into addresses (address_line1, address_line2, city, state, postal_code, country_id)
      select ${data.addressLine1}, ${data.addressLine2}, ${data.city}, ${data.state}, ${data.postalCode}, ${data.countryId}
      on conflict (address_line1, address_line2, city, state, postal_code, country_id) do nothing
      returning id
    ),

    address_id as (
      select id from created_address

      union

      select a.id
      from addresses a
      where address_line1 = ${data.addressLine1}
        and address_line2 = ${data.addressLine2}
        and city = ${data.city}
        and state = ${data.state}
        and postal_code = ${data.postalCode}
        and country_id = ${data.countryId}
    ),

    receiver_id as (
      insert into receivers (full_name)
      values (${data.fullName})
      returning id
    )

    select a.id as addressId, r.id as receiverId
    from address_id a, receiver_id r
  `;

  const [result] = (await db.execute(query)) as AddressAndReceiverResult[];
  return result;
};
