import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { orderItems, orders, productItems } from 'src/db/schema';
import { CartItemReference } from 'src/db/types';

type CreateOrder = {
  total: number;
  userId: string | null;
  orderDate: Date;
  shippingAddressId: number;
  receiverId: number;
  productItems: CartItemReference[];
};

export const createOrder = async (data: CreateOrder): Promise<void> => {
  await db.transaction(async (trx) => {
    const [order] = await trx
      .insert(orders)
      .values({
        userId: data.userId,
        orderDate: data.orderDate,
        shippingAddressId: data.shippingAddressId,
        receiverId: data.receiverId,
        total: data.total,
      })
      .returning({ id: orders.id });

    const orderItemsData = data.productItems.map((item) => ({
      productItemId: item.productItemId,
      orderId: order.id,
      quantity: item.quantity,
      price: item.price,
    }));

    await trx.insert(orderItems).values(orderItemsData);

    const orderItemsIds = orderItemsData.map(
      ({ productItemId }) => productItemId,
    );

    await trx
      .update(productItems)
      .set({
        stock: sql`${productItems.stock} - ${orderItems.quantity}`,
      })
      .from(orderItems)
      .where(
        and(
          eq(productItems.id, orderItems.productItemId),
          inArray(orderItems.productItemId, orderItemsIds),
        ),
      );
  });
};
