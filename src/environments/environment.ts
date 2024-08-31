export const environment = {
  s3Url: import.meta.env['VITE_S3_URL'] as string,
  stripePublishableKey: import.meta.env[
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ] as string,
};
