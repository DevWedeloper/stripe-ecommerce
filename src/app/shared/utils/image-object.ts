import { decode } from 'blurhash';
import { createCanvas } from 'canvas';
import { ProductDetails, ProductWithImageAndPricing } from 'src/db/types';
import { environment } from 'src/environments/environment';
import { PaginatedProducts } from 'src/server/use-cases/types/paginated';

export const getS3ImageUrl = ({
  path,
  bucketName,
}: {
  path: string;
  bucketName: string;
}): string => {
  const s3Url = environment.s3Url;
  return `${s3Url}/${bucketName}/${path}`;
};

const decodeBlurHashToImage = (blurHash: string): string => {
  const width = 32;
  const height = 32;
  const pixels = decode(blurHash, width, height);

  const canvas = createCanvas(width, height);
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
  path: string | null,
  placeholder: string | null,
  bucketName: string,
) => ({
  imagePath: path
    ? getS3ImageUrl({
        path,
        bucketName,
      })
    : '/fallback.svg',
  placeholder: placeholder
    ? decodeBlurHashToImage(placeholder)
    : decodeBlurHashToImage('00D]o8'),
});

export const transformProductImageObjects = (
  products: ProductDetails,
): ProductDetails => ({
  ...products,
  ...transformImagePathAndPlaceholder(
    products.imagePath,
    products.placeholder,
    environment.productImagesS3Bucket,
  ),
  imageObjects: products.imageObjects.map((imageObject) => ({
    ...imageObject,
    ...transformImagePathAndPlaceholder(
      imageObject.imagePath,
      imageObject.placeholder,
      environment.productImagesS3Bucket,
    ),
  })),
});

const transformProductImagePathAndPlaceholder = (
  product: ProductWithImageAndPricing,
): ProductWithImageAndPricing => ({
  ...product,
  ...transformImagePathAndPlaceholder(
    product.imagePath,
    product.placeholder,
    environment.productImagesS3Bucket,
  ),
});

export const transformProductImagePathsAndPlaceholders = (
  data: PaginatedProducts,
): PaginatedProducts => ({
  ...data,
  products: data.products.map(transformProductImagePathAndPlaceholder),
});
