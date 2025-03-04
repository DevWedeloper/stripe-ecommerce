import { and, eq, getTableColumns } from 'drizzle-orm';
import { db } from 'src/db';
import { productImages, products } from 'src/db/schema';

export const getProductImagesByUserId = async (
  userId: string,
  productId: number,
) =>
  db
    .select({ ...getTableColumns(productImages) })
    .from(products)
    .innerJoin(productImages, eq(productImages.productId, products.id))
    .where(
      and(
        eq(products.userId, userId),
        eq(products.id, productId),
        eq(products.isDeleted, false),
      ),
    );
