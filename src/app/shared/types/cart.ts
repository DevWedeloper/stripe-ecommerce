import { ProductItemObject, ProductWithImageAndPricing } from 'src/db/types';

export type CartItem = Omit<
  ProductWithImageAndPricing & ProductItemObject,
  'id' | 'lowestPrice'
> & {
  productId: number;
  quantity: number;
};
