import { difference, isEqual, pick } from 'lodash-es';
import { getUserProductById } from 'src/db/data-access/product/get-user-product-by-id';
import { updateProductByUserId as updateProductByUserIdFromDb } from 'src/db/data-access/product/update-product-by-user-id';
import {
  UpdateProductSchema,
  UserProductFormSchema,
} from 'src/schemas/product';
import { mapProductToFormData } from 'src/utils/product';

type Variants = UserProductFormSchema['variants'];

export const updateProductByUserId = async (
  userId: string,
  { modified, modifiedImages }: UpdateProductSchema,
) => {
  const productId = validateId(modified.id, 'Product');
  const originalProduct = await getUserProductById({ userId, productId });
  const original = mapProductToFormData(originalProduct);
  const originalImages = originalProduct.imageObjects ?? [];

  const isNameAndDescriptionSame = isEqual(
    pick(original, ['name', 'description']),
    pick(modified, ['name', 'description']),
  );

  const productData = !isNameAndDescriptionSame
    ? { id: productId, userId, ...pick(modified, ['name', 'description']) }
    : undefined;

  const productItemsData = modified.items
    .filter((modifiedItem) => {
      const originalItem = original.items.find(
        (item) => item.id === modifiedItem.id,
      );

      return !isEqual(
        pick(originalItem, ['stock', 'price']),
        pick(modifiedItem, ['stock', 'price']),
      );
    })
    .map((item) => ({ ...item, id: validateId(item.id, 'Item') }));

  const updatedImages = modifiedImages.existing
    .filter((modifiedImage) => {
      const originalImage = originalImages.find(
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

  const addedImages = modifiedImages.added.map((image) => ({
    productId,
    ...image,
  }));

  const deletedImages = originalImages
    .filter(
      (originalImage) =>
        !modifiedImages.existing.some((img) => img.id === originalImage.id),
    )
    .map(({ id }) => ({ id }));

  const productImagesData = { updatedImages, addedImages, deletedImages };

  const originalVariants = mapVariants(original.variants);
  const modifiedVariants = mapVariants(modified.variants, true);

  const updatedVariationOptions = modifiedVariants.flatMap(
    (modifiedVariant) => {
      const originalVariant = originalVariants.find(
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

  const addedVariationOptions = modifiedVariants.flatMap((modifiedVariant) =>
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

  await updateProductByUserIdFromDb({
    userId,
    productId,
    productData,
    productItemsData,
    productImagesData,
    variationOptionsData,
    categoryId,
    tagIds,
  });

  return getUserProductById({ userId, productId });
};

const validateId = <T>(id: T | null, entity: string): T => {
  if (id === null) {
    throw new Error(`${entity} ID cannot be null`);
  }

  return id;
};

const mapVariants = (variants: Variants, includeAddedOptions = false) =>
  variants.map((variant) => ({
    id: validateId(variant.id, 'Variant'),
    variation: variant.variation,
    existingOptions: variant.options.map((option) => ({
      id: validateId(option.id, 'Option'),
      order: option.order,
    })),
    addedOptions: includeAddedOptions
      ? variant.options.filter((option) => option.id === null)
      : [],
  }));
