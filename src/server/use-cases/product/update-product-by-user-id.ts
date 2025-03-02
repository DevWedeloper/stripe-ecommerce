import { difference, isEqual, pick } from 'lodash-es';
import { updateProductByUserId as updateProductByUserIdFromDb } from 'src/db/data-access/product/update-product-by-user-id';
import { UpdateProductSchema } from 'src/schemas/product';

export const updateProductByUserId = ({
  userId,
  productId,
  original,
  modified,
}: UpdateProductSchema) => {
  const isNameAndDescriptionSame = isEqual(
    pick(original, ['name', 'description']),
    pick(modified, ['name', 'description']),
  );

  const productData = !isNameAndDescriptionSame
    ? { id: productId, userId, ...pick(modified, ['name', 'description']) }
    : undefined;

  const productItemsData = modified.items.filter((modifiedItem) => {
    const originalItem = original.items.find(
      (item) => item.id === modifiedItem.id,
    );

    return !isEqual(
      pick(originalItem, ['stock', 'price']),
      pick(modifiedItem, ['stock', 'price']),
    );
  });

  const updatedImages = modified.images.existing
    .filter((modifiedImage) => {
      const originalImage = original.images.existing.find(
        (img) => img.id === modifiedImage.id,
      );

      return (
        originalImage &&
        !isEqual(
          pick(originalImage, ['isThumbnail', 'order']),
          pick(modifiedImage, ['isThumbnail', 'order']),
        )
      );
    })
    .map(({ id, isThumbnail, order }) => ({ id, isThumbnail, order }));

  const addedImages = modified.images.added.map((image) => ({
    productId,
    ...image,
  }));

  const deletedImages = original.images.existing
    .filter(
      (originalImage) =>
        !modified.images.existing.some((img) => img.id === originalImage.id),
    )
    .map(({ id }) => ({ id }));

  const productImagesData = { updatedImages, addedImages, deletedImages };

  const updatedVariationOptions = modified.variants.flatMap(
    (modifiedVariant) => {
      const originalVariant = original.variants.find(
        (v) => v.id === modifiedVariant.id,
      );

      if (!originalVariant) return [];

      return modifiedVariant.existingOptions.filter((opt) => {
        const originalOpt = originalVariant.existingOptions.find(
          (o) => o.id === opt.id,
        );
        return originalOpt && originalOpt.order !== opt.order;
      });
    },
  );

  const addedVariationOptions = modified.variants.flatMap((modifiedVariant) =>
    modifiedVariant.addedOptions.map((option) => ({
      value: option.value,
      variationId: modifiedVariant.id,
      order: option.order,
    })),
  );

  const variationOptionsData = {
    updatedVariationOptions,
    addedVariationOptions,
  };

  const categoryId =
    modified.categoryId === original.categoryId
      ? undefined
      : modified.categoryId;

  const addedTagIds = difference(modified.tagIds, original.tagIds);
  const deletedTagIds = difference(original.tagIds, modified.tagIds);

  const tagIds = { addedTagIds, deletedTagIds };

  return updateProductByUserIdFromDb({
    userId,
    productId,
    productData,
    productItemsData,
    productImagesData,
    variationOptionsData,
    categoryId,
    tagIds,
  });
};
