import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from 'src/db';
import {
  Categories,
  productCategories,
  ProductImages,
  productImages,
  ProductImagesInsert,
  ProductItems,
  productItems,
  Products,
  products,
  productTags,
  TagsSelect,
  VariationOptions,
  variationOptions,
  VariationOptionsInsert,
} from 'src/db/schema';

type UpdateProductData = {
  userId: string;
  productId: Products['id'];
  productData?: Omit<Products, 'isDeleted'>;
  productItemsData: Omit<ProductItems, 'productId'>[];
  productImagesData: {
    updatedImages: {
      id: ProductImages['id'];
      isThumbnail: ProductImages['isThumbnail'];
      order: ProductImages['order'];
    }[];
    addedImages: ProductImagesInsert[];
    deletedImages: {
      id: ProductImages['id'];
    }[];
  };
  variationOptionsData: {
    updatedVariationOptions: {
      id: VariationOptions['id'];
      order: VariationOptions['order'];
    }[];
    addedVariationOptions: VariationOptionsInsert[];
  };
  categoryId?: Categories['id'];
  tagIds: {
    addedTagIds: TagsSelect['id'][];
    deletedTagIds: TagsSelect['id'][];
  };
};

export const updateProductByUserId = async ({
  userId,
  productId,
  productData,
  productItemsData,
  productImagesData,
  variationOptionsData,
  categoryId,
  tagIds,
}: UpdateProductData) => {
  await db.transaction(async (trx) => {
    if (productData) {
      const { id, name, description } = productData;
      await trx
        .update(products)
        .set({ name, description })
        .where(and(eq(products.id, id), eq(products.userId, userId)));
    }

    if (productItemsData.length > 0) {
      const ids = productItemsData.map((item) => item.id);
      const skus = productItemsData.map((item) => item.sku);

      const stockCase = sql`CASE`;
      const priceCase = sql`CASE`;

      productItemsData.forEach((item) => {
        stockCase.append(
          sql` WHEN ${productItems.id} = ${item.id} AND ${productItems.sku} = ${item.sku} THEN ${item.stock}`,
        );
        priceCase.append(
          sql` WHEN ${productItems.id} = ${item.id} AND ${productItems.sku} = ${item.sku} THEN ${item.price}`,
        );
      });

      stockCase.append(sql` ELSE ${productItems.stock} END`);
      priceCase.append(sql` ELSE ${productItems.price} END`);

      await trx
        .update(productItems)
        .set({
          stock: stockCase,
          price: priceCase,
        })
        .where(
          and(inArray(productItems.id, ids), inArray(productItems.sku, skus)),
        );
    }

    const { updatedImages, addedImages, deletedImages } = productImagesData;

    if (updatedImages.length > 0) {
      const ids = updatedImages.map((item) => item.id);

      const newThumbnail = updatedImages.find((item) => item.isThumbnail);

      if (newThumbnail) {
        await trx
          .update(productImages)
          .set({ isThumbnail: false })
          .where(
            and(
              eq(productImages.productId, productId),
              eq(productImages.isThumbnail, true),
            ),
          );
      }

      const isThumbnailCase = sql`CASE`;
      const orderCase = sql`CASE`;

      updatedImages.forEach((item) => {
        isThumbnailCase.append(
          sql` WHEN ${productImages.id} = ${item.id} THEN ${item.isThumbnail}`,
        );
        orderCase.append(
          sql` WHEN ${productImages.id} = ${item.id} THEN ${item.order}`,
        );
      });

      isThumbnailCase.append(sql` ELSE ${productImages.isThumbnail} END`);
      orderCase.append(sql` ELSE ${productImages.order} END`);

      await trx
        .update(productImages)
        .set({
          isThumbnail: isThumbnailCase,
          order: orderCase,
        })
        .where(inArray(productImages.id, ids));
    }

    if (addedImages.length > 0) {
      await trx.insert(productImages).values(addedImages);
    }

    if (deletedImages.length > 0) {
      const idsToDelete = deletedImages.map((image) => image.id);

      await trx
        .delete(productImages)
        .where(inArray(productImages.id, idsToDelete));
    }

    const { updatedVariationOptions, addedVariationOptions } =
      variationOptionsData;

    if (updatedVariationOptions.length > 0) {
      const ids = updatedVariationOptions.map((item) => item.id);

      const orderCase = sql`CASE`;

      updatedVariationOptions.forEach((item) => {
        orderCase.append(
          sql` WHEN ${variationOptions.id} = ${item.id} THEN ${item.order}`,
        );
      });

      orderCase.append(sql` ELSE ${variationOptions.order} END`);

      await trx
        .update(variationOptions)
        .set({
          order: orderCase,
        })
        .where(inArray(variationOptions.id, ids));
    }

    if (addedVariationOptions.length > 0) {
      await trx.insert(variationOptions).values(addedVariationOptions);
    }

    if (categoryId) {
      await trx
        .delete(productCategories)
        .where(eq(productCategories.productId, productId));

      await trx.insert(productCategories).values({
        productId,
        categoryId,
      });
    }

    const { addedTagIds, deletedTagIds } = tagIds;

    if (addedTagIds.length > 0) {
      const tagInserts = addedTagIds.map((tagId) => ({ productId, tagId }));
      await trx.insert(productTags).values(tagInserts);
    }

    if (deletedTagIds.length > 0) {
      await trx
        .delete(productTags)
        .where(
          and(
            eq(productTags.productId, productId),
            inArray(productTags.tagId, deletedTagIds),
          ),
        );
    }
  });
};
