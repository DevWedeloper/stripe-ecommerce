import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { productImages } from 'src/db/schema';
import {
  doItemVariationsMatchVariants,
  hasUniqueCombinations,
  hasUniqueValues,
  hasValidVariations,
} from 'src/utils/product';
import { z, ZodIssueCode } from 'zod';

const productImagesInsertWithoutProductId = createInsertSchema(
  productImages,
).omit({
  productId: true,
});

const uniqueValues =
  (key?: string): z.RefinementEffect<unknown[]>['refinement'] =>
  (arr, ctx) => {
    if (!hasUniqueValues(arr, key)) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: key
          ? `Duplicate values found in "${key}"`
          : 'Duplicate values found',
      });
    }
  };

const errorMessage = (
  field: string,
  type: 'required' | 'tooLong' | 'tooShort' | 'min' | 'max',
) => {
  const messages = {
    required: `${field} is required`,
    tooLong: `${field} is too long`,
    tooShort: `${field} is too short`,
    min: `${field} must be a positive number`,
    max: `${field} is too large`,
  };
  return messages[type];
};

const idSchema = z.number().nullable();

const nameSchema = (field: string) =>
  z
    .string()
    .min(1, errorMessage(field, 'required'))
    .max(256, errorMessage(field, 'tooLong'));

const orderSchema = z.number().int().min(0, errorMessage('Order', 'min'));

const variationSchema = z.object({
  id: idSchema,
  variation: nameSchema('Variation name'),
  options: z
    .array(
      z.object({
        id: idSchema,
        value: nameSchema('Option value'),
        order: orderSchema,
      }),
    )
    .min(1, errorMessage('Option', 'required'))
    .superRefine(uniqueValues('value')),
});

export type VariationSchema = z.infer<typeof variationSchema>;

const variationItemSchema = z.object({
  name: nameSchema('Variation name'),
  value: nameSchema('Variation value'),
  order: orderSchema,
});

const itemSchema = z.object({
  id: idSchema,
  sku: nameSchema('SKU'),
  stock: z.number().int().min(0, errorMessage('Stock', 'min')),
  price: z.number().min(0, errorMessage('Price', 'min')),
  variations: z
    .array(variationItemSchema)
    .min(1, errorMessage('Variation', 'required'))
    .superRefine(uniqueValues('name')),
});

export const userProductSchema = z
  .object({
    id: idSchema,
    name: nameSchema('Name'),
    description: nameSchema('Description'),
    variants: z
      .array(variationSchema)
      .min(1, errorMessage('Variant', 'required'))
      .max(4, 'Too many variants')
      .superRefine(uniqueValues('variation')),
    items: z
      .array(itemSchema)
      .min(1, errorMessage('Item', 'required'))
      .superRefine(uniqueValues('sku'))
      .superRefine((data, ctx) => {
        if (
          !hasUniqueCombinations(data, {
            arrayKey: 'variations',
            combinationKeys: ['name', 'value'],
          })
        ) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: 'Duplicate combination found',
          });
        }
      }),
    categoryId: z
      .number()
      .int()
      .min(1, errorMessage('Category ID', 'required')),
    tagIds: z
      .array(z.number().int().min(1, errorMessage('Tag ID', 'min')))
      .max(10, 'Too many tags')
      .superRefine(uniqueValues()),
  })
  .superRefine((data, ctx) => {
    if (!hasValidVariations(data)) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'Some variations do not exist in the defined variants.',
      });
    }
  })
  .superRefine((data, ctx) => {
    if (!doItemVariationsMatchVariants(data)) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'Some items are missing required variations.',
      });
    }
  });

export type UserProductFormSchema = z.infer<typeof userProductSchema>;

export const createProductSchema = z.object({
  productDetails: userProductSchema,
  images: z.array(productImagesInsertWithoutProductId),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  modified: userProductSchema,
  modifiedImages: z.object({
    existing: z.array(
      createSelectSchema(productImages).pick({
        id: true,
        isThumbnail: true,
        order: true,
      }),
    ),
    added: z.array(productImagesInsertWithoutProductId),
  }),
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
