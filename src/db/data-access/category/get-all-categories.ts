import { db } from '../..';
import { Categories, categories } from '../../schema';

export const getAllCategories = async (): Promise<Categories[]> =>
  await db.select().from(categories);
