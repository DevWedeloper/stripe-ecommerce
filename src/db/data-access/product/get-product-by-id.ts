import { eq } from 'drizzle-orm';
import { db } from '../..';
import { Products, products } from '../../schema';

export const getProductById = async (id: number): Promise<Products | null> => {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return product || null;
};
