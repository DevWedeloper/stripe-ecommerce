import { and, count, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { addresses, orders, receivers, userAddresses } from 'src/db/schema';

export const deleteAddress = async (
  userId: string,
  addressId: number,
  receiverId: number,
): Promise<void> => {
  await db.transaction(async (trx) => {
    await trx
      .delete(addresses)
      .where(
        and(
          eq(addresses.id, addressId),
          eq(
            db
              .select({ count: count() })
              .from(userAddresses)
              .where(eq(userAddresses.addressId, addressId)),
            1,
          ),
          eq(
            db
              .select({ count: count() })
              .from(orders)
              .where(eq(orders.shippingAddressId, addressId)),
            0,
          ),
        ),
      );

    await trx
      .delete(receivers)
      .where(
        and(
          eq(receivers.id, receiverId),
          eq(
            db
              .select({ count: count() })
              .from(orders)
              .where(eq(orders.receiverId, receiverId)),
            0,
          ),
        ),
      );

    await trx
      .delete(userAddresses)
      .where(
        and(
          eq(userAddresses.userId, userId),
          eq(userAddresses.addressId, addressId),
          eq(userAddresses.receiverId, receiverId),
        ),
      );
  });
};
