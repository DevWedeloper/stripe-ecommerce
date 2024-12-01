import { ProductItemObject, ProductWithImageAndPricing } from 'src/db/types';

export type CartItem = Omit<
  ProductWithImageAndPricing & ProductItemObject,
  'id' | 'lowestPrice' | 'productId'
> & {
  productItemId: number;
  quantity: number;
};
