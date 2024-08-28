import { eq } from 'drizzle-orm';
import { db } from '..';
import { categories } from '../schema';
import { lower } from './utils';

export const getCategoryIdByName = async (
  categoryName: string,
): Promise<number | null> => {
  const categoryResult = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(lower(categories.name), categoryName.toLocaleLowerCase()))
    .limit(1);

  return categoryResult.length > 0 ? categoryResult[0].id : null;
};
