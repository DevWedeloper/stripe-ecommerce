import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
  productImages,
  productItems,
  products,
  variationOptions,
  variations,
} from 'src/db/schema';
import { z } from 'zod';

const productImagesInsertWithoutProductId = createInsertSchema(
  productImages,
).omit({
  productId: true,
});
const variationOptionsInsertWithoutVariationId = createInsertSchema(
  variationOptions,
).omit({
  variationId: true,
});

export const createProductSchema = z.object({
  productData: createInsertSchema(products).omit({ isDeleted: true }),
  variationsData: z.array(
    createInsertSchema(variations).omit({ productId: true }),
  ),
  variationOptionsData: z.array(
    variationOptionsInsertWithoutVariationId.merge(
      z.object({
        variationName: z.string(),
      }),
    ),
  ),
  productItemsData: z.array(
    createInsertSchema(productItems)
      .omit({ productId: true })
      .merge(
        z.object({
          variations: z.array(
            z.object({
              name: z.string(),
              value: z.string(),
              order: z.number(),
            }),
          ),
        }),
      ),
  ),
  categoryId: z.number(),
  productImagesData: z.array(productImagesInsertWithoutProductId),
  tagIds: z.array(z.number()).optional(),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

const productUpdateSchema = z.object({
  name: z.string(),
  description: z.string(),
  variants: z.array(
    z.object({
      id: z.number(),
      variation: z.string(),
      existingOptions: z.array(
        createSelectSchema(variationOptions).pick({
          id: true,
          order: true,
        }),
      ),
      addedOptions: z.array(variationOptionsInsertWithoutVariationId),
    }),
  ),
  items: z.array(createSelectSchema(productItems).omit({ productId: true })),
  images: z.object({
    existing: z.array(
      createSelectSchema(productImages).pick({
        id: true,
        isThumbnail: true,
        order: true,
      }),
    ),
    added: z.array(productImagesInsertWithoutProductId),
  }),
  categoryId: z.number(),
  tagIds: z.array(z.number()),
});

export const updateProductSchema = z.object({
  userId: z.string(),
  productId: z.number(),
  original: productUpdateSchema,
  modified: productUpdateSchema,
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
