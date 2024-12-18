import {
  AddressInsert,
  ProductImages,
  ProductItems,
  Products,
  ReceiverInsert,
  VariationOptions,
  Variations,
} from './schema';

type Nullable<T> = T | null;

type NullishImageObject = {
  imagePath: Nullable<ProductImages['imagePath']>;
  placeholder: Nullable<ProductImages['placeholder']>;
};

export type ImageObject = {
  id: ProductImages['id'];
  imagePath: ProductImages['imagePath'];
  placeholder: ProductImages['placeholder'];
};

export type ProductDetails = Omit<Products, 'userId'> &
  NullishImageObject & {
    items: ProductItemObject[];
    imageObjects: ImageObject[];
    variations: Record<string, string[]>;
  };

export type ProductWithImageAndPricing = Omit<Products, 'userId'> &
  NullishImageObject & { lowestPrice: number };

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

export type CartItemReference = {
  productItemId: ProductItems['productId'];
  sku: ProductItems['sku'];
  quantity: number;
  price: number;
};

export type FindOrCreateAddressData = Omit<AddressInsert, 'countryId'> &
  ReceiverInsert & {
    countryCode: string;
  };
