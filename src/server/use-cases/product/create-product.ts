import { createProduct as createProductFromDb } from 'src/db/data-access/product/create-product';
import { CreateProductData } from 'src/db/types';

export const createProduct = async (data: CreateProductData): Promise<void> =>
  createProductFromDb(data);
