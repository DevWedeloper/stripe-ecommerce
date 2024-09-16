import { decode } from 'blurhash';
import { toast } from 'ngx-sonner';
import { Products } from 'src/db/schema';
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

export const transformProductImagePathAndPlaceholder = (
  product: Products,
): Products => ({
  ...product,
  imagePath: product.imagePath ? getS3ImageUrl(product.imagePath) : null,
  placeholder: product.placeholder
    ? decodeBlurHashToImage(product.placeholder)
    : null,
});

export const transformProductImagePathsAndPlaceholders = (
  data: PaginatedProducts,
): PaginatedProducts => ({
  ...data,
  products: data.products.map(transformProductImagePathAndPlaceholder),
});
