import { getEnvVar } from 'src/env';

export const environment = {
  s3Url: getEnvVar('VITE_S3_URL'),
  stripePublishableKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY'),
  productImagesS3Bucket: getEnvVar('VITE_PRODUCT_IMAGES_S3_BUCKET'),
  avatarsS3Bucket: getEnvVar('VITE_AVATARS_S3_BUCKET'),
};
