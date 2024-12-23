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

      existing_address as (
        select id as existing_address_id
        from ${addresses}
        where
          address_line1 = ${addressData.addressLine1} and
          address_line2 = ${addressData.addressLine2} and
          city = ${addressData.city} and
          state = ${addressData.state} and
          postal_code = ${addressData.postalCode} and
          country_id = ${addressData.countryId}
        limit 1
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
          and not exists (
            select 1 from existing_address
          )
        returning id as updated_address_id
      ),

      new_address as (
        insert into ${addresses} (address_line1, address_line2, city, state, postal_code, country_id)
        select ${addressData.addressLine1}, ${addressData.addressLine2}, ${addressData.city}, ${addressData.state}, ${addressData.postalCode}, ${addressData.countryId}
        from checks
        where address_user_count > 1 or address_order_count > 0
        returning id as new_address_id
      ),

      final_address as (
        select
          coalesce(
            (select new_address_id from new_address),
            (select updated_address_id from updated_address),
            (select existing_address_id from existing_address)
          ) as final_address_id
      ),

      user_address_update as (
        update ${userAddresses}
        set
          address_id = (select final_address_id from final_address)
        where
          user_id = ${userId}
          and address_id = ${addressId}
          and receiver_id = ${receiverId}
        returning address_id as updated_address_id
      ),

      delete_unused_address as (
        delete from ${addresses}
        using checks
        where
          ${addresses}.id = ${addressId}
          and checks.address_user_count = 1
          and checks.address_order_count = 0
          and (select final_address_id from final_address) != ${addressId}
      )

      select * from user_address_update;
      `,
  );
};
