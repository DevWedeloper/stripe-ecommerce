import { getProductById as fetchProductById } from 'src/db/data-access/product/get-product-by-id';
import { groupAndSortVariations } from 'src/utils/product';
import { sortByOrder } from '../utils/sort';

export const getProductById = async (id: number) => {
  const result = await fetchProductById(id);

  if (!result) {
    return null;
  }

  const sortedVariations = sortByOrder(result.variations);
  const sortedImageObjects = sortByOrder(result.imageObjects);

  const product = {
    ...result,
    variations: groupAndSortVariations(sortedVariations),
    imageObjects: sortedImageObjects,
  };

  return product;
};
