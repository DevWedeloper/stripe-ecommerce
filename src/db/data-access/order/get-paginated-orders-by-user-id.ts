import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from 'src/db';
import {
  orderItems,
  orders,
  OrderStatusEnum,
  productConfiguration,
  productItems,
  products,
  variationOptions,
  variations,
} from 'src/db/schema';
import { OrderItemWithVariations, VariationObject } from 'src/db/types';
import { formatPaginatedResult, totalCount } from '../utils';

export const getPaginatedOrdersByUserId = async (
  userId: string,
  offset: number,
  pageSize: number,
  status?: OrderStatusEnum,
) => {
  const itemsQuery = db.$with('items_query').as(
    db
      .select({
        ...getTableColumns(orderItems),
        name: sql<string>`${products.name}`.as('product_name'),
        variationName: sql<string>`${variations.name}`.as('variation_name'),
        variationValue: variationOptions.value,
      })
      .from(orderItems)
      .innerJoin(productItems, eq(orderItems.productItemId, productItems.id))
      .innerJoin(products, eq(productItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(
        productConfiguration,
        eq(productItems.id, productConfiguration.productItemId),
      )
      .leftJoin(
        variationOptions,
        eq(productConfiguration.variationOptionId, variationOptions.id),
      )
      .leftJoin(variations, eq(variationOptions.variationId, variations.id))
      .where(and(eq(orderItems.orderId, orders.id), eq(orders.userId, userId))),
  );

  const itemsVariationsQuery = db.$with('items_variations_query').as(
    db
      .with(itemsQuery)
      .select({
        id: itemsQuery.id,
        productItemId: itemsQuery.productItemId,
        orderId: itemsQuery.orderId,
        quantity: itemsQuery.quantity,
        price: itemsQuery.price,
        name: itemsQuery.name,
        variations: sql<VariationObject[]>`
          array_agg(
            json_build_object(
              'name', ${itemsQuery.variationName},
              'value', ${itemsQuery.variationValue}
            )
          )
        `.as('variations'),
      })
      .from(itemsQuery)
      .groupBy(
        itemsQuery.id,
        itemsQuery.productItemId,
        itemsQuery.orderId,
        itemsQuery.quantity,
        itemsQuery.price,
        itemsQuery.name,
      ),
  );

  const query = db
    .with(itemsVariationsQuery)
    .select({
      ...getTableColumns(orders),
      items: sql<OrderItemWithVariations[]>`
        array_agg(
          json_build_object(
            'id', ${itemsVariationsQuery.id},
            'productItemId', ${itemsVariationsQuery.productItemId},
            'orderId', ${itemsVariationsQuery.orderId},
            'quantity', ${itemsVariationsQuery.quantity},
            'price', ${itemsVariationsQuery.price},
            'name', ${itemsVariationsQuery.name},
            'variations', ${itemsVariationsQuery.variations}
          )
        )
      `.as('order_items'),
      totalCount: totalCount.as('full_count'),
    })
    .from(orders)
    .leftJoin(itemsVariationsQuery, eq(orders.id, itemsVariationsQuery.orderId))
    .where(
      and(
        eq(orders.userId, userId),
        status ? eq(orders.status, status) : undefined,
      ),
    )
    .groupBy(orders.id)
    .offset(offset)
    .limit(pageSize)
    .orderBy(desc(orders.orderDate));

  const result = await query;

  const { data, totalCount: totalOrders } = formatPaginatedResult(result);

  return {
    orders: data,
    totalOrders,
  };
};
