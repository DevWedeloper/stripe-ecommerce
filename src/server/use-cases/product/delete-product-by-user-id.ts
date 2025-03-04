import { SupabaseClient } from '@supabase/supabase-js';
import { deleteProductByUserId as deleteProductByUserIdFromDb } from 'src/db/data-access/product/delete-product-by-user-id';
import { getProductImagesByUserId } from 'src/db/data-access/product/get-product-images-by-user-id';
import { getEnvVar } from 'src/env';

const SUPABASE_PRODUCT_IMAGES_S3_BUCKET = getEnvVar(
  'VITE_PRODUCT_IMAGES_S3_BUCKET',
);

export const deleteProductByUserId = async (
  supabase: SupabaseClient,
  { userId, productId }: { userId: string; productId: number },
) => {
  const images = await getProductImagesByUserId(userId, productId);
  const paths = images.map((image) => image.imagePath);

  if (paths.length > 0) {
    const { error } = await supabase.storage
      .from(SUPABASE_PRODUCT_IMAGES_S3_BUCKET)
      .remove(paths);

    if (error) return { error };
  }

  await deleteProductByUserIdFromDb({ userId, productId });

  return { error: null };
};
