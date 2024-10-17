import { getProductById as fetchProductById } from 'src/db/data-access/product/get-product-by-id';
import { ProductDetails } from 'src/db/types';

export const getProductById = async (
  id: number,
): Promise<ProductDetails | null> => fetchProductById(id);
