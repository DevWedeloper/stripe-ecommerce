import { getProductPricingDetails as getProductPricingDetailsFromDb } from 'src/db/data-access/product/get-product-pricing-details';
import { ConfirmCartSchema } from 'src/schemas/product';

export const getProductPricingDetails = async (data: ConfirmCartSchema) => {
  const productItemIds = data.map((item) => item.productItemId);

  return getProductPricingDetailsFromDb(productItemIds);
};
