import { getPaginatedProductsByKeyword } from 'src/db/data-access/product/get-paginated-products-by-keyword';
import { PaginatedProducts } from '../types/paginated';

export const searchProductsByKeyword = async (
  keyword: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedProducts> => {
  const offset = (page - 1) * pageSize;

  const { products, totalProducts } = await getPaginatedProductsByKeyword(
    keyword.trim(),
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
