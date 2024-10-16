import {
  ProductImages,
  ProductItems,
  Products,
  VariationOptions,
  Variations,
} from './schema';

type NullishImageObject = {
  [K in keyof Pick<ProductImages, 'imagePath' | 'placeholder'>]:
    | ProductImages[K]
    | null;
};

export type ImageObject = Pick<
  ProductImages,
  'id' | 'imagePath' | 'placeholder'
>;

export type ProductDetails = Products & {
  items: ProductItemObject[];
} & NullishImageObject & {
    imageObjects: ImageObject[];
  } & { variations: Record<string, string[]> };

export type ProductsWithThumbnail = Products & NullishImageObject;

export type ProductItemObject = Pick<
  ProductItems,
  'id' | 'sku' | 'stock' | 'price'
> & { variations: VariationObject[] };

export type VariationObject = Pick<Variations, 'name'> &
  Pick<VariationOptions, 'value'>;
