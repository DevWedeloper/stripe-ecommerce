import { getProductById as fetchProductById } from 'src/db/data-access/product/get-product-by-id';
import { ProductDetails } from 'src/db/types';
import { reduceToRecord } from '../utils/record';
import { sortByOrder } from '../utils/sort';

export const getProductById = async (
  id: number,
): Promise<ProductDetails | null> => {
  const result = await fetchProductById(id);

  if (!result) {
    return null;
  }

  const sortedVariations = sortByOrder(result.variations);
  const sortedImageObjects = sortByOrder(result.imageObjects);

  const product = {
    ...result,
    variations: reduceToRecord(sortedVariations),
    imageObjects: sortedImageObjects,
  };

  return product;
};
