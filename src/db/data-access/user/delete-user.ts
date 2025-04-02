import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { products, users } from 'src/db/schema';

export const deleteUser = async (userId: string) =>
  db.transaction(async (trx) => {
    await trx
      .update(users)
      .set({ isDeleted: true, avatarPath: null })
      .where(eq(users.id, userId));

    await trx
      .update(products)
      .set({ isDeleted: true })
      .where(eq(products.userId, userId));
  });
