import { isNotNull, notInArray } from 'drizzle-orm';
import { db } from '../..';
import { Categories, categories } from '../../schema';

export const getAllLeafCategories = async (): Promise<Categories[]> => {
  const parentIdsQuery = db
    .select({ id: categories.parentCategoryId })
    .from(categories)
    .where(isNotNull(categories.parentCategoryId));

  return db
    .select()
    .from(categories)
    .where(notInArray(categories.id, parentIdsQuery))
    .orderBy(categories.name);
};
