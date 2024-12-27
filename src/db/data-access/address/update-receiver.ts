import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import {
  orders,
  ReceiverInsert,
  receivers,
  userAddresses,
} from 'src/db/schema';

/*
Overview of Logic:
--------------------
1. **Receiver Update Conditions**:
   - A receiver can only be updated if:
     - The receiver is **not yet linked to any orders** (`receiver_order_count = 0`).
   - If this condition is violated (i.e., the receiver is already linked to orders), a **new receiver field** is created.
*/
export const updateReceiver = async (
  userId: string,
  addressId: number,
  receiverId: number,
  receiverData: ReceiverInsert,
): Promise<void> => {
  await db.execute(
    sql`
      with checks as (
        select count(*) as receiver_order_count
        from ${orders}
        where ${orders.receiverId} = ${receiverId}
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
        receiver_id = coalesce((select new_receiver_id from new_receiver), ${receiverId})
      where
        user_id = ${userId} and
        address_id = ${addressId} and
        receiver_id = ${receiverId};
    `,
  );
};
