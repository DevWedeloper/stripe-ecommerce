import { and, eq, sql } from 'drizzle-orm';
import { db } from 'src/db';
import {
  categories,
  productCategories,
  productConfiguration,
  productImages,
  productItems,
  products,
  productTags,
  tags,
  variationOptions,
  variations,
} from 'src/db/schema';
import { ImageObject, ProductItemObject, VariationObject } from 'src/db/types';

export type ImageObjectWithThumbnail = ImageObject & { isThumbnail: boolean };

export type VariationObjectWithIds = VariationObject & {
  variationId: number;
  optionId: number;
};

export type UserProductData = Awaited<ReturnType<typeof getUserProductById>>;

export const getUserProductById = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: number;
}) => {
  const imageObjectQuery = db.$with('image_object_query').as(
    db
      .select({
        productId: productImages.productId,
        imageObjects: sql<ImageObjectWithThumbnail[] | null>`
          array_agg(
            json_build_object(
              'id', ${productImages.id},
              'imagePath', ${productImages.imagePath}, 
              'placeholder', ${productImages.placeholder},
              'isThumbnail', ${productImages.isThumbnail},
              'order', ${productImages.order}
            )
            order by ${productImages.order} asc
          )
        `.as('image_objects'),
      })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .groupBy(productImages.productId),
  );

  const productItemDetailsQuery = db.$with('product_item_details_query').as(
    db
      .select({
        productId: productItems.productId,
        id: productItems.id,
        sku: productItems.sku,
        stock: productItems.stock,
        price: productItems.price,
        variationId: sql<number>`${variations.id}`.as('variation_id'),
        variationName: variations.name,
        variationValue: variationOptions.value,
        optionsId: sql<number>`${variationOptions.id}`.as('option_id'),
        variationOptionsOrder: variationOptions.order,
      })
      .from(productItems)
      .leftJoin(
        productConfiguration,
        eq(productItems.id, productConfiguration.productItemId),
      )
      .leftJoin(
        variationOptions,
        eq(productConfiguration.variationOptionId, variationOptions.id),
      )
      .leftJoin(variations, eq(variationOptions.variationId, variations.id))
      .where(eq(productItems.productId, productId)),
  );

  const productItemVariationsQuery = db
    .$with('product_item_variations_query')
    .as(
      db
        .select({
          productId: productItemDetailsQuery.productId,
          id: productItemDetailsQuery.id,
          sku: productItemDetailsQuery.sku,
          stock: productItemDetailsQuery.stock,
          price: productItemDetailsQuery.price,
          variations: sql<VariationObject[]>`
            array_agg(
              json_build_object(
                'name', ${productItemDetailsQuery.variationName},
                'value', ${productItemDetailsQuery.variationValue},
                'order', ${productItemDetailsQuery.variationOptionsOrder}
              )
            )
          `.as('variations'),
        })
        .from(productItemDetailsQuery)
        .groupBy(
          productItemDetailsQuery.productId,
          productItemDetailsQuery.id,
          productItemDetailsQuery.sku,
          productItemDetailsQuery.stock,
          productItemDetailsQuery.price,
        ),
    );

  const productItemAggregateQuery = db.$with('product_item_aggregate_query').as(
    db
      .with(productItemVariationsQuery)
      .select({
        productId: productItemVariationsQuery.productId,
        items: sql<ProductItemObject[]>`
          array_agg(
            json_build_object(
              'id', ${productItemVariationsQuery.id},
              'sku', ${productItemVariationsQuery.sku},
              'stock', ${productItemVariationsQuery.stock},
              'price', ${productItemVariationsQuery.price},
              'variations', ${productItemVariationsQuery.variations}
            )
          )
        `.as('product_items'),
      })
      .from(productItemVariationsQuery)
      .groupBy(productItemVariationsQuery.productId),
  );

  const variationsQuery = db.$with('variations_query').as(
    db
      .select({
        productId: productItemDetailsQuery.productId,
        variations: sql<VariationObjectWithIds[]>`
          array_agg(
            distinct jsonb_build_object(
              'variationId', ${productItemDetailsQuery.variationId},
              'optionId', ${productItemDetailsQuery.optionsId},
              'name', ${productItemDetailsQuery.variationName},
              'value', ${productItemDetailsQuery.variationValue},
              'order', ${productItemDetailsQuery.variationOptionsOrder}
            )
          )
        `.as('variations'),
      })
      .from(productItemDetailsQuery)
      .groupBy(productItemDetailsQuery.productId),
  );

  const categoryQuery = db.$with('category_query').as(
    db
      .select({
        productId: productCategories.productId,
        category: sql<{ id: number; name: string }>`
          json_build_object(
            'id', ${categories.id},
            'name', ${categories.name}
          )
        `.as('category'),
      })
      .from(categories)
      .innerJoin(
        productCategories,
        eq(categories.id, productCategories.categoryId),
      )
      .where(eq(productCategories.productId, productId))
      .limit(1),
  );

  const tagsQuery = db.$with('tags_query').as(
    db
      .select({
        productId: productTags.productId,
        tags: sql<{ id: number; name: string }[] | null>`
          array_agg(
            json_build_object(
              'id', ${tags.id},
              'name', ${tags.name}
            )
          )
        `.as('tags'),
      })
      .from(tags)
      .innerJoin(productTags, eq(tags.id, productTags.tagId))
      .where(eq(productTags.productId, productId))
      .groupBy(productTags.productId),
  );

  const query = db
    .with(
      imageObjectQuery,
      productItemDetailsQuery,
      productItemAggregateQuery,
      variationsQuery,
      categoryQuery,
      tagsQuery,
    )
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      variations: variationsQuery.variations,
      items: productItemAggregateQuery.items,
      imageObjects: imageObjectQuery.imageObjects,
      category: categoryQuery.category,
      tags: tagsQuery.tags,
    })
    .from(products)
    .leftJoin(imageObjectQuery, eq(imageObjectQuery.productId, products.id))
    .leftJoin(
      productItemAggregateQuery,
      eq(productItemAggregateQuery.productId, products.id),
    )
    .leftJoin(variationsQuery, eq(variationsQuery.productId, products.id))
    .leftJoin(categoryQuery, eq(categoryQuery.productId, products.id))
    .leftJoin(tagsQuery, eq(tagsQuery.productId, products.id))
    .where(
      and(
        eq(products.id, productId),
        eq(products.userId, userId),
        eq(products.isDeleted, false),
      ),
    )
    .limit(1);

  const [result] = await query;

  return result || null;
};
