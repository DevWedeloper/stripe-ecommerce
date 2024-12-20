import { db } from '../..';
import { Categories, categories } from '../../schema';

export const getAllCategories = async (): Promise<Categories[]> =>
  db.select().from(categories);
