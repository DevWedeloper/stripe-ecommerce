import { decode } from 'blurhash';
import { toast } from 'ngx-sonner';
import { ProductsWithAllImages, ProductsWithThumbnail } from 'src/db/types';
import { environment } from 'src/environments/environment';
import { positiveIntSchema } from 'src/schemas/zod-schemas';
import { PaginatedProducts } from 'src/server/use-cases/types/paginated-products.type';

const getS3ImageUrl = (imagePath: string | null): string => {
  const s3Url = environment.s3Url;
  return `${s3Url}/${imagePath}`;
};

export const parseToPositiveInt = (value: any, fallback: number): number => {
  const result = positiveIntSchema.safeParse(Number(value));
  return result.success ? result.data : fallback;
};

export const showError = (message: string): void => {
  toast.error(message, {
    action: {
      label: 'Dismiss',
      onClick: () => {},
    },
  });
};

const decodeBlurHashToImage = (blurHash: string): string => {
  const width = 32;
  const height = 32;
  const pixels = decode(blurHash, width, height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    const url = canvas.toDataURL();

    return url;
  } else {
    return '';
  }
};

const transformImagePathAndPlaceholder = (
  imagePath: string | null,
  placeholder: string | null,
) => ({
  imagePath: imagePath ? getS3ImageUrl(imagePath) : '',
  placeholder: placeholder ? decodeBlurHashToImage(placeholder) : '',
});

export const transformProductImageObjects = (
  products: ProductsWithAllImages,
): ProductsWithAllImages => ({
  ...products,
  ...transformImagePathAndPlaceholder(products.imagePath, products.placeholder),
  imageObjects: products.imageObjects.map((imageObject) => ({
    ...transformImagePathAndPlaceholder(
      imageObject.imagePath,
      imageObject.placeholder,
    ),
  })),
});

const transformProductImagePathAndPlaceholder = (
  product: ProductsWithThumbnail,
): ProductsWithThumbnail => ({
  ...product,
  ...transformImagePathAndPlaceholder(product.imagePath, product.placeholder),
});

export const transformProductImagePathsAndPlaceholders = (
  data: PaginatedProducts,
): PaginatedProducts => ({
  ...data,
  products: data.products.map(transformProductImagePathAndPlaceholder),
});
