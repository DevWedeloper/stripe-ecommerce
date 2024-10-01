import { ProductsWithThumbnail } from 'src/db/types';

export type PaginatedProducts = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalProducts: number;
  products: ProductsWithThumbnail[];
};
