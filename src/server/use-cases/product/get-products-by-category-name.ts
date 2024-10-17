import { getPaginatedProductsByCategoryName } from 'src/db/data-access/product/get-paginated-products-by-category-name';
import { PaginatedProducts } from '../types/paginated-products.type';

const convertToQueryFormat = (name: string) =>
  name
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getProductsByCategoryName = async (
  categoryName: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedProducts> => {
  const offset = (page - 1) * pageSize;

  const { products, totalProducts } = await getPaginatedProductsByCategoryName(
    convertToQueryFormat(categoryName),
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
