import { createProduct as createProductFromDb } from 'src/db/data-access/product/create-product';
import { CreateProductSchema } from 'src/schemas/product';

export const createProduct = async (
  userId: string,
  data: CreateProductSchema,
): Promise<void> => {
  const { name, description, variants, items, categoryId, tagIds } =
    data.productDetails;

  const variationsData = variants.map((variant) => ({
    name: variant.variation,
  }));

  const variationOptionsData = variants.flatMap((variant) =>
    variant.options.map((option) => ({
      variationName: variant.variation,
      value: option.value,
      order: option.order,
    })),
  );

  const orderedVariationOptions = variationOptionsData.reduce(
    ({ result, orderMap }, item) => {
      const order = (orderMap[item.variationName] || 0) + 1;

      return {
        result: [...result, { ...item, order }],
        orderMap: { ...orderMap, [item.variationName]: order },
      };
    },
    {
      result: [] as typeof variationOptionsData,
      orderMap: {} as Record<string, number>,
    },
  ).result;

  const updatedProductImages = data.images.map((img, index) => ({
    ...img,
    order: index + 1,
  }));

  const hasThumbnail = updatedProductImages.some((img) => img.isThumbnail);
  const finalProductImages = hasThumbnail
    ? updatedProductImages
    : updatedProductImages.map((img, index) =>
        index === 0 ? { ...img, isThumbnail: true } : img,
      );

  await createProductFromDb({
    productData: {
      name,
      userId,
      description,
    },
    variationsData,
    variationOptionsData: orderedVariationOptions,
    productItemsData: items,
    productImagesData: finalProductImages,
    categoryId,
    tagIds,
  });
};
