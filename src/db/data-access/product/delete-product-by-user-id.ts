import { and, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { productImages, products } from 'src/db/schema';

export const deleteProductByUserId = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: number;
}) =>
  db.transaction(async (trx) => {
    await trx
      .update(products)
      .set({ isDeleted: true })
      .where(and(eq(products.userId, userId), eq(products.id, productId)));

    await trx
      .delete(productImages)
      .where(eq(productImages.productId, productId));
  });
