import {
  AddressInsert,
  AddressSelect,
  Categories,
  CountrySelect,
  OrderItemsSelect,
  OrderSelect,
  ProductImages,
  ProductImagesInsert,
  ProductInsert,
  ProductItems,
  ProductItemsInsert,
  Products,
  ReceiverInsert,
  ReceiverSelect,
  TagsSelect,
  UserAddressesSelect,
  VariationOptions,
  VariationOptionsInsert,
  Variations,
  VariationsInsert,
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

export type CreateProductData = {
  productData: Omit<ProductInsert, 'isDeleted'>;
  variationsData: Omit<VariationsInsert, 'productId'>[];
  variationOptionsData: (Omit<VariationOptionsInsert, 'variationId'> & {
    variationName: VariationsInsert['name'];
  })[];
  productItemsData: (Omit<ProductItemsInsert, 'productId'> & {
    variationValue: VariationOptions['value'];
  })[];
  categoryId: Categories['id'];
  productImagesData: Omit<ProductImagesInsert, 'productId'>[];
  tagIds?: TagsSelect['id'][];
};

export type ProductDetails = Omit<Products, 'isDeleted'> &
  NullishImageObject & {
    items: ProductItemObject[];
    imageObjects: ImageObject[];
    variations: Record<string, string[]>;
  };

export type ProductWithImageAndPricing = Omit<Products, 'isDeleted'> &
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
  sellerUserId: string;
  productItemId: ProductItems['productId'];
  sku: ProductItems['sku'];
  quantity: number;
  price: number;
};

export type AddressAndReceiverInsert = AddressInsert & ReceiverInsert;

export type AddressReceiverLink = {
  addressId: AddressSelect['id'];
  receiverId: ReceiverSelect['id'];
} & AddressAndReceiverInsert;

export type AddressAndReceiverData = {
  isDefault: UserAddressesSelect['isDefault'];
  addressId: AddressSelect['id'];
  addressLine1: AddressSelect['addressLine1'];
  addressLine2: AddressSelect['addressLine2'];
  city: AddressSelect['city'];
  state: AddressSelect['state'];
  postalCode: AddressSelect['postalCode'];
  countryId: CountrySelect['id'];
  countryCode: CountrySelect['code'];
  receiverId: ReceiverSelect['id'];
  fullName: ReceiverSelect['fullName'];
};

export type UpdateAddressData = {
  userId: string;
  addressId: number;
  receiverId: number;
  currentAddressData: AddressInsert;
  currentReceiverData: ReceiverInsert;
  newAddressData: AddressInsert;
  newReceiverData: ReceiverInsert;
};

export type OrderItemWithVariations = OrderItemsSelect & {
  name: Products['name'];
  variations: VariationObject[];
};

export type OrderWithItems = OrderSelect & {
  items: OrderItemWithVariations[];
};
