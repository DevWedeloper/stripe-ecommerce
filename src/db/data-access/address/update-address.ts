import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import { addresses, AddressInsert, orders, userAddresses } from 'src/db/schema';

export const updateAddress = async (
  userId: string,
  addressId: number,
  receiverId: number,
  addressData: AddressInsert,
): Promise<void> => {
  await db.execute(
    sql`
      with checks as (
        select
          (select count(*)
          from ${userAddresses}
          where ${userAddresses.addressId} = ${addressId})
          as address_user_count,

          (select count(*)
          from ${orders}
          where ${orders.shippingAddressId} = ${addressId})
          as address_order_count
      ),

      updated_address as (
        update ${addresses}
        set
          address_line1 = ${addressData.addressLine1},
          address_line2 = ${addressData.addressLine2},
          city = ${addressData.city},
          state = ${addressData.state},
          postal_code = ${addressData.postalCode},
          country_id = ${addressData.countryId}
        from checks
        where address_user_count = 1 and address_order_count = 0
        and ${addresses}.id = ${addressId}
        returning id as updated_address_id
      ),

      new_address as (
        insert into ${addresses} (address_line1, address_line2, city, state, postal_code, country_id)
        select ${addressData.addressLine1}, ${addressData.addressLine2}, ${addressData.city}, ${addressData.state}, ${addressData.postalCode}, ${addressData.countryId}
        from checks
        where address_user_count >= 2 or address_order_count > 0
        returning id as new_address_id
      )

      update ${userAddresses}
      set
        address_id = coalesce((select new_address_id from new_address), ${addressId})
      where
        user_id = ${userId} and
        address_id = ${addressId} and
        receiver_id = ${receiverId};
      `,
  );
};
