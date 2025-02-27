import { getUserProductById as getUserProductByIdFromDb } from 'src/db/data-access/product/get-user-product-by-id';

export const getUserProductById = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: number;
}) => getUserProductByIdFromDb({ userId, productId });
