import { db } from 'src/db';
import {
  Categories,
  productCategories,
  productConfiguration,
  ProductConfigurationInsert,
  productImages,
  ProductImagesInsert,
  ProductInsert,
  productItems,
  ProductItemsInsert,
  products,
  productTags,
  TagsSelect,
  variationOptions,
  VariationOptionsInsert,
  variations,
  VariationsInsert,
} from 'src/db/schema';
import { VariationObject } from 'src/db/types';

type CreateProductData = {
  productData: Omit<ProductInsert, 'isDeleted'>;
  variationsData: Omit<VariationsInsert, 'productId'>[];
  variationOptionsData: (Omit<VariationOptionsInsert, 'variationId'> & {
    variationName: VariationsInsert['name'];
  })[];
  productItemsData: (Omit<ProductItemsInsert, 'productId'> & {
    variations: VariationObject[];
  })[];
  categoryId: Categories['id'];
  productImagesData: Omit<ProductImagesInsert, 'productId'>[];
  tagIds: TagsSelect['id'][];
};

export const createProduct = async ({
  productData,
  variationsData,
  variationOptionsData,
  productItemsData,
  categoryId,
  productImagesData,
  tagIds,
}: CreateProductData): Promise<void> => {
  await db.transaction(async (trx) => {
    const productResult = await trx
      .insert(products)
      .values(productData)
      .returning({ id: products.id });

    const productId = productResult[0].id;

    const variationInsert = variationsData.map((v) => ({
      ...v,
      productId,
    }));

    const variationResult = await trx
      .insert(variations)
      .values(variationInsert)
      .returning({
        id: variations.id,
        name: variations.name,
        productId: variations.productId,
      });

    const variationOptionsInsert: VariationOptionsInsert[] =
      variationOptionsData.map((vo) => {
        const matchedVariation = variationResult.find(
          (v) => v.name === vo.variationName,
        );
        if (!matchedVariation) {
          throw new Error(
            `Variation not found for Variation Name: ${vo.variationName}`,
          );
        }

        return { ...vo, variationId: matchedVariation.id };
      });

    const variationOptionsResult = await trx
      .insert(variationOptions)
      .values(variationOptionsInsert)
      .returning({
        id: variationOptions.id,
        variationId: variationOptions.variationId,
        value: variationOptions.value,
      });

    const productItemInsert = productItemsData.map((item) => ({
      ...item,
      productId,
    }));

    const productItemsResult = await trx
      .insert(productItems)
      .values(productItemInsert)
      .returning({ id: productItems.id, sku: productItems.sku });

    const flattenedProductItems = productItemsData.flatMap((item) =>
      item.variations.map((variation) => ({
        productId,
        sku: item.sku,
        stock: item.stock,
        price: item.price,
        variationName: variation.name,
        variationValue: variation.value,
      })),
    );

    const productItemMap = new Map(
      productItemsResult.map((pi) => [pi.sku, pi]),
    );
    const variationMap = new Map(variationResult.map((v) => [v.id, v]));
    const variationOptionMap = new Map(
      variationOptionsResult.map((vo) => {
        const variation = variationMap.get(vo.variationId);
        if (!variation) {
          throw new Error(
            `Variation not found for Variation ID: ${vo.variationId} (Value: "${vo.value}")`,
          );
        }
        return [`${variation.name}-${vo.value}`, vo];
      }),
    );

    const productConfigurationInsert: ProductConfigurationInsert[] =
      flattenedProductItems.map((item) => {
        const matchedProductItem = productItemMap.get(item.sku);

        if (!matchedProductItem) {
          throw new Error(`Product Item not found for SKU: ${item.sku}`);
        }

        const matchedVariationOption = variationOptionMap.get(
          `${item.variationName}-${item.variationValue}`,
        );

        if (!matchedVariationOption) {
          throw new Error(
            `Variation Option not found for Value: "${item.variationValue}" (SKU: ${item.sku})`,
          );
        }

        const matchedVariation = variationMap.get(
          matchedVariationOption.variationId,
        );

        if (!matchedVariation) {
          throw new Error(
            `Variation not found for Variation ID: ${matchedVariationOption.variationId} (Value: "${item.variationValue}", SKU: ${item.sku})`,
          );
        }

        return {
          productItemId: matchedProductItem.id,
          variationOptionId: matchedVariationOption.id,
          variationId: matchedVariationOption.variationId,
          productId,
          variationProductId: matchedVariation.productId,
        };
      });

    await trx.insert(productConfiguration).values(productConfigurationInsert);

    await trx.insert(productCategories).values({
      productId,
      categoryId,
    });

    if (tagIds) {
      const tagInsert = tagIds.map((tagId) => ({ productId, tagId }));

      await trx.insert(productTags).values(tagInsert);
    }

    const productImagesInsert = productImagesData.map((image) => ({
      ...image,
      productId,
    }));

    await trx.insert(productImages).values(productImagesInsert);
  });
};
