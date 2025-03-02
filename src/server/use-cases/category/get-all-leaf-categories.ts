import { getAllLeafCategories as getAllLeafCategoriesFromDb } from 'src/db/data-access/category/get-all-leaf-categories';
import { Categories } from 'src/db/schema';

export const getAllLeafCategories = async (): Promise<Categories[]> =>
  getAllLeafCategoriesFromDb();
