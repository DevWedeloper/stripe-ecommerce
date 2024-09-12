import { getCategoryIdByName } from 'src/db/data-access/category/get-category-id-by-name';
import { getPaginatedProductsByCategory } from 'src/db/data-access/get-paginated-products-by-category';
import { getSubcategoryIdByParentId } from 'src/db/data-access/category/get-subcategory-id-by-parent-id';
import { PaginatedProducts } from '../types/paginated-products.type';

const getCategoryAndChildCategoryIds = async (
  categoryId: number,
): Promise<number[]> => {
  const childCategories = await getSubcategoryIdByParentId(categoryId);

  const nestedChildCategoryIds = await Promise.all(
    childCategories.map((id) => getCategoryAndChildCategoryIds(id)),
  );

  return [categoryId, ...nestedChildCategoryIds.flat()];
};

const convertToQueryFormat = (name: string) => name.replace(/-/g, ' ');

export const getProductsByCategoryName = async (
  categoryName: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedProducts> => {
  const categoryId = await getCategoryIdByName(
    convertToQueryFormat(categoryName),
  );

  if (!categoryId) {
    return {
      page,
      pageSize,
      totalPages: 0,
      totalProducts: 0,
      products: [],
    };
  }

  const allCategoryIds = await getCategoryAndChildCategoryIds(categoryId);

  const offset = (page - 1) * pageSize;

  const { products, totalProducts } = await getPaginatedProductsByCategory(
    allCategoryIds,
    offset,
    pageSize,
  );

  const totalPages = Math.ceil(totalProducts / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    totalProducts,
    products,
  };
};
