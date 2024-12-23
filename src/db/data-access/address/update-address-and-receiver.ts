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
