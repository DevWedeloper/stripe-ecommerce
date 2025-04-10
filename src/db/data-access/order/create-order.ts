import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { orderItems, orders, productItems } from 'src/db/schema';
import { CartItemSchema, CreateOrderSchema } from 'src/schemas/order';

export const createOrder = async (data: CreateOrderSchema): Promise<void> => {
  const groupedBySeller = data.productItems.reduce(
    (acc, item) => {
      if (!acc[item.sellerUserId]) {
        acc[item.sellerUserId] = [];
      }
      acc[item.sellerUserId].push(item);
      return acc;
    },
    {} as Record<string, CartItemSchema[]>,
  );

  const ordersToInsert = Object.keys(groupedBySeller).map((sellerUserId) => {
    const sellerItems = groupedBySeller[sellerUserId];
    return {
      userId: data.userId,
      orderDate: data.orderDate,
      shippingAddressId: data.shippingAddressId,
      receiverId: data.receiverId,
      total: sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    };
  });

  const orderItemsToInsert = Object.keys(groupedBySeller).flatMap(
    (sellerUserId) => {
      const sellerItems = groupedBySeller[sellerUserId];
      return sellerItems.map((item) => ({
        productItemId: item.productItemId,
        quantity: item.quantity,
        price: item.price,
      }));
    },
  );

  const productItemIdsToUpdate = orderItemsToInsert.map(
    (item) => item.productItemId,
  );

  await db.transaction(async (trx) => {
    const ordersResult = await trx
      .insert(orders)
      .values(ordersToInsert)
      .returning({ id: orders.id });

    const orderItemsWithOrderId = orderItemsToInsert.map((item, index) => ({
      ...item,
      orderId: ordersResult[index].id,
    }));

    await trx.insert(orderItems).values(orderItemsWithOrderId);

    await trx
      .update(productItems)
      .set({
        stock: sql`${productItems.stock} - ${orderItems.quantity}`,
      })
      .from(orderItems)
      .where(
        and(
          eq(productItems.id, orderItems.productItemId),
          inArray(orderItems.productItemId, productItemIdsToUpdate),
        ),
      );
  });
};
