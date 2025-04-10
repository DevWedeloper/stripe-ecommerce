import { getProductById } from 'src/server/use-cases/product/get-product-by-id';
import { getPaginatedAddressesByUserId } from './data-access/address/get-paginated-addresses-by-user-id';
import { getPaginatedOrdersByUserId } from './data-access/order/get-paginated-orders-by-user-id';
import { getPaginatedProductsByUserId } from './data-access/product/get-paginated-products-by-user-id';
import {
  OrderItemsSelect,
  ProductImages,
  ProductItems,
  Products,
  VariationOptions,
  Variations,
} from './schema';

export type ImageObject = {
  id: ProductImages['id'];
  imagePath: ProductImages['imagePath'];
  placeholder: ProductImages['placeholder'];
  order: ProductImages['order'];
};

export type ProductDetails = NonNullable<
  Awaited<ReturnType<typeof getProductById>>
>;

export type ProductWithImageAndPricing = Awaited<
  ReturnType<typeof getPaginatedProductsByUserId>
>['products'][number];

export type ProductItemObject = {
  id: ProductItems['id'];
  sku: ProductItems['sku'];
  stock: ProductItems['stock'];
  price: ProductItems['price'];
  variations: VariationObject[];
};

export type VariationObject = {
  name: Variations['name'];
  value: VariationOptions['value'];
  order: VariationOptions['order'];
};

export type AddressAndReceiverData = Awaited<
  ReturnType<typeof getPaginatedAddressesByUserId>
>['addresses'][number];

export type OrderItemWithVariations = OrderItemsSelect & {
  name: Products['name'];
  variations: VariationObject[];
  canReview: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type OrderWithItems = Awaited<
  ReturnType<typeof getPaginatedOrdersByUserId>
>['orders'][number];
