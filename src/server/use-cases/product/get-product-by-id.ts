import { getProductById as fetchProductById } from 'src/db/data-access/product/get-product-by-id';
import { ProductsWithAllImages } from 'src/db/types';

export const getProductById = async (
  id: number,
): Promise<ProductsWithAllImages | null> => fetchProductById(id);
