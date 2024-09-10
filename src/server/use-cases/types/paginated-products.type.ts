import { Products } from 'src/db/schema';

export type PaginatedProducts = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalProducts: number;
  products: Products[];
};
