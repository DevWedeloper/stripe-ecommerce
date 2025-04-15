import { inArray } from 'drizzle-orm';
import { db } from 'src/db';
import { productItems } from 'src/db/schema';

export const getProductPricingDetails = async (productItemIds: number[]) =>
  db
    .select({
      productItemId: productItems.id,
      price: productItems.price,
    })
    .from(productItems)
    .where(inArray(productItems.id, productItemIds));
