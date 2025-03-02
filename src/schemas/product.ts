import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { productImages, productItems, variationOptions } from 'src/db/schema';
import { z } from 'zod';

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
      addedOptions: z.array(
        createInsertSchema(variationOptions).omit({ variationId: true }),
      ),
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
    added: z.array(createInsertSchema(productImages).omit({ productId: true })),
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
