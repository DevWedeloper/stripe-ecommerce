import { getPaginatedProductsByCategoryName } from 'src/db/data-access/product/get-paginated-products-by-category-name';
import { toTitleCase } from 'src/utils/string-format';
import { PaginatedProducts } from '../types/paginated';

export const getProductsByCategoryName = async (
  categoryName: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedProducts> => {
  const offset = (page - 1) * pageSize;

  const { products, totalProducts } = await getPaginatedProductsByCategoryName(
    toTitleCase(categoryName),
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
