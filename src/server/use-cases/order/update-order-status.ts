import { updateOrderStatus as updateOrderStatusFromDb } from 'src/db/data-access/order/update-order-status';
import { updateToDelivered } from 'src/db/data-access/order/update-to-delivered';
import { OrderSelect, OrderStatusEnum } from 'src/db/schema';

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatusEnum,
): Promise<OrderSelect> => {
  if (status === 'Delivered') {
    return updateToDelivered(orderId);
  }

  return updateOrderStatusFromDb(orderId, status);
};
