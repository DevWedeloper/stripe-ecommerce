import { db } from '..';
import { Categories, categories } from '../schema';

export type CategoryWithSubcategories = Categories & {
  subcategories: CategoryWithSubcategories[];
};

export const getAllCategories = async (): Promise<
  CategoryWithSubcategories[]
> => {
  const categoriesData = await db.select().from(categories);

  const buildCategoryTree = (
    categories: Categories[],
    parentId: number | null = null,
  ): CategoryWithSubcategories[] => {
    return categories
      .filter((category) => category.parentCategoryId === parentId)
      .map((category) => ({
        ...category,
        subcategories: buildCategoryTree(categories, category.id),
      }));
  };

  const categoryTree = buildCategoryTree(categoriesData);
  return categoryTree;
};
