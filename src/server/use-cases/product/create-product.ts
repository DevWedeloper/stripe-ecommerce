import { createProduct as createProductFromDb } from 'src/db/data-access/product/create-product';
import { CreateProductSchema } from 'src/schemas/product';

export const createProduct = async (data: CreateProductSchema): Promise<void> =>
  createProductFromDb(data);
