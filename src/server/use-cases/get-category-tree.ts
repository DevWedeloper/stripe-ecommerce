import { getAllCategories } from 'src/db/data-access/category/get-all-categories';
import { Categories } from 'src/db/schema';

export type CategoryWithSubcategories = Categories & {
  subcategories: CategoryWithSubcategories[];
};

export const getCategoryTree = async (): Promise<
  CategoryWithSubcategories[]
> => {
  const categoriesData = await getAllCategories();

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
