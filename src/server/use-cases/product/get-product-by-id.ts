import { getProductById as fetchProductById } from 'src/db/data-access/product/get-product-by-id';
import { Products } from 'src/db/schema';

export const getProductById = async (id: number): Promise<Products | null> =>
  fetchProductById(id);
