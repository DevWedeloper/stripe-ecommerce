import { ProductImages, Products } from './schema';

type NullishImageObject = {
  [K in keyof Pick<ProductImages, 'imagePath' | 'placeholder'>]:
    | ProductImages[K]
    | null;
};

export type ImageObject = Pick<ProductImages, 'imagePath' | 'placeholder'>;

export type ProductsWithAllImages = Products &
  NullishImageObject & {
    imageObjects: ImageObject[];
  };

export type ProductsWithThumbnail = Products & NullishImageObject;
