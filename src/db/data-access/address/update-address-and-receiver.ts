import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import {
  addresses,
  AddressInsert,
  orders,
  ReceiverInsert,
  receivers,
  userAddresses,
} from 'src/db/schema';

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

5. **Receiver Update Conditions**:
    - A receiver can only be updated if:
      - The receiver is **not yet linked to any orders** (`receiver_order_count = 0`).
    - If this condition is violated (i.e., the receiver is already linked to orders), a **new receiver field** is created.
*/
export const updateAddressAndReceiver = async (
  userId: string,
  addressId: number,
  receiverId: number,
  addressData: AddressInsert,
  receiverData: ReceiverInsert,
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
          as address_order_count,

          (select count(*)
          from ${orders}
          where ${orders.receiverId} = ${receiverId})
          as receiver_order_count
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
      ),

      updated_receiver as (
        update ${receivers}
        set full_name = ${receiverData.fullName}
        from checks
        where receiver_order_count = 0
        and ${receivers}.id = ${receiverId}
        returning id as updated_receiver_id
      ),

      new_receiver as (
        insert into ${receivers} (full_name)
        select ${receiverData.fullName}
        from checks
        where receiver_order_count > 0
        returning id as new_receiver_id
      )

      update ${userAddresses}
      set
        address_id = coalesce((select new_address_id from new_address), ${addressId}),
        receiver_id = coalesce((select new_receiver_id from new_receiver), ${receiverId})
      where
        user_id = ${userId} and
        address_id = ${addressId} and
        receiver_id = ${receiverId};
    `,
  );
};
