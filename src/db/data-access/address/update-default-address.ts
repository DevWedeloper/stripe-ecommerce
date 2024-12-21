import { and, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { userAddresses } from 'src/db/schema';

export const updateDefaultAddress = async (
  userId: string,
  addressId: number,
  receiverId: number,
): Promise<void> => {
  await db.transaction(async (trx) => {
    await trx
      .update(userAddresses)
      .set({ isDefault: false })
      .where(eq(userAddresses.userId, userId));

    await trx
      .update(userAddresses)
      .set({ isDefault: true })
      .where(
        and(
          eq(userAddresses.userId, userId),
          eq(userAddresses.addressId, addressId),
          eq(userAddresses.receiverId, receiverId),
        ),
      );
  });
};
