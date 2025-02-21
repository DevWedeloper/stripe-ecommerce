import { getPaginatedProductsByUserId } from 'src/db/data-access/product/get-paginated-products-by-user-id';
import { PaginatedProducts } from '../types/paginated';

export const getProductsByUserId = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedProducts> => {
  const offset = (page - 1) * pageSize;

  const { products, totalProducts } = await getPaginatedProductsByUserId(
    userId,
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
