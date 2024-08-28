import { eq } from 'drizzle-orm';
import { db } from '..';
import { categories } from '../schema';

export const getSubcategoryIdByParentId = async (
  parentId: number,
): Promise<number[]> => {
  const childCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.parentCategoryId, parentId));

  return childCategories.map((category) => category.id);
};
