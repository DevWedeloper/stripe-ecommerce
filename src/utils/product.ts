import {
  UserProductData,
  VariationObjectWithIds,
} from 'src/db/data-access/product/get-user-product-by-id';
import { UserProductFormSchema } from 'src/schemas/product';

export const groupAndSortVariations = (
  variations: VariationObjectWithIds[],
) => {
  const grouped = variations.reduce(
    (acc, { variationId, optionId, name, value, order }) => ({
      ...acc,
      [name]: {
        id: acc[name]?.id ?? variationId,
        options: [
          ...(acc[name]?.options || []),
          { id: optionId, value, order },
        ],
      },
    }),
    {} as Record<
      string,
      {
        id: number;
        options: { id: number; value: string; order: number }[];
      }
    >,
  );

  return Object.keys(grouped).map((name) => {
    const sortedOptions = grouped[name].options.sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    return {
      id: grouped[name].id,
      variation: name,
      options: sortedOptions,
    };
  });
};

export const mapProductToFormData = (
  product: UserProductData,
): UserProductFormSchema => {
  const { id, name, description, variations, items, category, tags } = product;

  const variants = groupAndSortVariations(variations);

  const tagIds = tags ? tags.map((tag) => tag.id) : [];

  return {
    id,
    name,
    description,
    variants,
    items,
    categoryId: category.id,
    tagIds,
  };
};

export const hasUniqueValues = (arr: unknown[], key?: string): boolean => {
  const values = key
    ? arr
        .map((item) => {
          if (typeof item !== 'object' || item === null) return item; // Keep primitives

          if (!(key in item)) {
            console.warn(`Key "${key}" does not exist on item:`, item);
            return undefined; // Treat missing keys as undefined
          }

          return item[key as keyof typeof item]; // Extract key value
        })
        .filter((v) => v !== undefined) // Remove undefined (missing keys)
    : arr;

  return new Set(values).size === values.length;
};

export type UniqueCombinationConfig = {
  arrayKey?: string;
  combinationKeys: string[];
};

export const hasUniqueCombinations = (
  arr: unknown[],
  { arrayKey, combinationKeys }: UniqueCombinationConfig,
): boolean => {
  const combinations = arr.map((item) => {
    const source =
      arrayKey && (item as any)[arrayKey] ? (item as any)[arrayKey] : [item];

    if (!Array.isArray(source)) {
      console.warn(
        `uniqueCombination validator: arrayKey "${arrayKey}" is not an array.`,
      );
      return '';
    }

    const normalized = source
      .map((cItem) =>
        combinationKeys.map((key) => {
          if (!(key in cItem)) {
            console.warn(`combinationKey "${key}" not found.`);
            return '';
          }

          return String(cItem[key as keyof typeof cItem]).trim();
        }),
      )
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

    return JSON.stringify(normalized);
  });

  return new Set(combinations).size === combinations.length;
};

type VariantWithOptions = {
  variation: string;
  options: Array<{ value: string }>;
};

type ItemVariationWithValue = {
  name: string;
  value: string;
};

type ItemWithVariations = {
  variations: ItemVariationWithValue[];
};

export type VariationsValidationData = {
  variants: VariantWithOptions[];
  items: ItemWithVariations[];
};

export const hasValidVariations = ({
  variants,
  items,
}: VariationsValidationData): boolean => {
  const variantMap = new Map(
    variants.map((variant) => [
      variant.variation.trim(),
      new Set(variant.options.map((opt) => opt.value.trim())),
    ]),
  );

  return items.every((item) =>
    item.variations.every((variation) => {
      const varName = variation.name.trim();
      const varValue = variation.value.trim();
      const validOptions = variantMap.get(varName);

      return validOptions?.has(varValue) ?? false;
    }),
  );
};

type SimpleVariant = {
  variation: string;
};

type SimpleItemVariation = {
  name: string;
};

type SimpleItem = {
  variations: SimpleItemVariation[];
};

export type VariationMatchValidationData = {
  variants: SimpleVariant[];
  items: SimpleItem[];
};

export const doItemVariationsMatchVariants = ({
  variants,
  items,
}: VariationMatchValidationData): boolean => {
  const requiredVariationNames = variants
    .map((variant) => variant.variation.trim())
    .filter(Boolean);

  return items.every((item) => {
    const itemVariationNames = item.variations.map((v) => v.name.trim());
    return requiredVariationNames.every((requiredName) =>
      itemVariationNames.includes(requiredName),
    );
  });
};
