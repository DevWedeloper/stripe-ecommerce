import { getProductById as fetchProductById } from 'src/db/data-access/product/get-product-by-id';
import { ProductDetails } from 'src/db/types';

export const getProductById = async (
  id: number,
): Promise<ProductDetails | null> => {
  const result = await fetchProductById(id);

  if (!result) {
    return null;
  }

  const product = {
    ...result,
    variations: result.variations.reduce<Record<string, string[]>>(
      (acc, { name: key, value }) => ({
        ...acc,
        [key]: acc[key] ? [...acc[key], value] : [value],
      }),
      {},
    ),
  };

  return product;
};
