import { ProductItems } from 'src/db/schema';

export type CartItemReference = {
  productId: ProductItems['productId'];
  sku: ProductItems['sku'];
  quantity: number;
};
