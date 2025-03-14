import { and, Column, eq, getTableColumns, sql } from 'drizzle-orm';
import { ImageObject, ProductItemObject, VariationObject } from 'src/db/types';
import { db } from '../..';
import {
  productConfiguration,
  productImages,
  productItems,
  products,
  variationOptions,
  variations,
} from '../../schema';
import { VariationObjectWithIds } from './get-user-product-by-id';

export const getProductById = async (id: number) => {
  const maxQuery = (col: Column) =>
    sql<string>`
      max(case when ${productImages.isThumbnail} = true then ${col} end)
    `;

  const imageObjectQuery = db.$with('image_object_query').as(
    db
      .select({
        productId: productImages.productId,
        imagePath: maxQuery(productImages.imagePath).as('image_path'),
        placeholder: maxQuery(productImages.placeholder).as('placeholder'),
        imageObjects: sql<ImageObject[]>`
          array_agg(
            json_build_object(
              'id', ${productImages.id},
              'imagePath', ${productImages.imagePath}, 
              'placeholder', ${productImages.placeholder},
              'order', ${productImages.order}
            )
          )
        `.as('image_objects'),
      })
      .from(productImages)
      .where(eq(productImages.productId, id))
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
      .where(eq(productItems.productId, id)),
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
                'value', ${productItemDetailsQuery.variationValue}
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

  const query = db
    .with(
      imageObjectQuery,
      productItemDetailsQuery,
      productItemAggregateQuery,
      variationsQuery,
    )
    .select({
      ...getTableColumns(products),
      imagePath: imageObjectQuery.imagePath,
      placeholder: imageObjectQuery.placeholder,
      imageObjects: imageObjectQuery.imageObjects,
      items: productItemAggregateQuery.items,
      variations: variationsQuery.variations,
    })
    .from(products)
    .leftJoin(imageObjectQuery, eq(imageObjectQuery.productId, products.id))
    .leftJoin(
      productItemAggregateQuery,
      eq(productItemAggregateQuery.productId, products.id),
    )
    .leftJoin(variationsQuery, eq(variationsQuery.productId, products.id))
    .where(and(eq(products.id, id), eq(products.isDeleted, false)))
    .limit(1);

  const [result] = await query;

  return result || null;
};
