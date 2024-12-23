import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import { addresses, AddressInsert, orders, userAddresses } from 'src/db/schema';

/*
Overview of Logic:
--------------------
1. **Address Update Conditions**:
    - An address can only be updated if:
      - The address is associated with only **one** user (`address_user_count = 1`).
      - The address is not linked to any **orders** (`address_order_count = 0`).
    - If either of these conditions is violated (i.e., the address is associated with multiple users or orders), a **new address** is created.

2. **Address Already Exists**:
    - If the address being updated **already exists** (matching the new data), it will be linked to the current user.
    - The **old address** will be deleted if:
      - It is still associated with **only one user**.
      - It is **not associated with any orders**.

3. **Final Address Logic**:
    - The final address used for the user update will be determined from the following priority:
      1. If a new address was created, use that.
      2. If the address was updated, use the updated address.
      3. If an existing address matches the new data, link to that.

4. **Address Cleanup**:
    - The original address is only deleted if:
      - It is no longer associated with any orders.
      - It is associated with only one user, and that user has moved to another address.
*/
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
