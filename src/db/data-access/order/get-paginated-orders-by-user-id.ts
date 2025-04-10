import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from 'src/db';
import {
  orderItems,
  orders,
  OrderStatusEnum,
  productConfiguration,
  productItems,
  products,
  userReviews,
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
        canReview: sql<boolean>`
          case 
            when ${orders.status} = 'Delivered'
              and ${orders.deliveredDate} >= (now() - interval '7 days')
              and ${userReviews.id} is null
            then true
            else false
          end
        `.as('can_review'),
        canEdit: sql<boolean>`
          case 
            when ${orders.status} = 'Delivered'
              and ${userReviews.createdAt} >= (now() - interval '1 day')
              and ${userReviews.id} is not null
              and ${userReviews.isDeleted} = false
            then true
            else false
          end
        `.as('can_edit'),
        canDelete: sql<boolean>`
          case
            when ${orders.status} = 'Delivered'
              and ${userReviews.createdAt} >= (now() - interval '1 day')
              and ${userReviews.id} is not null
              and ${userReviews.isDeleted} = false
            then true
            else false
          end
        `.as('can_delete'),
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
      .leftJoin(
        userReviews,
        and(
          eq(userReviews.orderItemId, orderItems.id),
          eq(userReviews.userId, userId),
        ),
      )
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
        canReview: itemsQuery.canReview,
        canEdit: itemsQuery.canEdit,
        canDelete: itemsQuery.canDelete,
      })
      .from(itemsQuery)
      .groupBy(
        itemsQuery.id,
        itemsQuery.productItemId,
        itemsQuery.orderId,
        itemsQuery.quantity,
        itemsQuery.price,
        itemsQuery.name,
        itemsQuery.canReview,
        itemsQuery.canEdit,
        itemsQuery.canDelete,
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
            'variations', ${itemsVariationsQuery.variations},
            'canReview', ${itemsVariationsQuery.canReview},
            'canEdit', ${itemsVariationsQuery.canEdit},
            'canDelete', ${itemsVariationsQuery.canDelete}
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
