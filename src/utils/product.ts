import { UserProductData } from 'src/db/data-access/product/get-user-product-by-id';
import { VariantsWithIds } from '../app/pages/user/(user)/product/types/variant';
import { UserProductFormData } from '../app/pages/user/(user)/product/utils/form';

export const mapProductToFormData = (
  product: UserProductData,
): UserProductFormData => {
  const { id, name, description, variations, items, category, tags } = product;

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
        options: { id: number; value: string; order: number | null }[];
      }
    >,
  );

  const variants = Object.keys(grouped).map((name) => {
    const sortedOptions = grouped[name].options.sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    return {
      id: grouped[name].id,
      variation: name,
      options: sortedOptions,
    };
  }) as VariantsWithIds[];

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
