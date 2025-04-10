import { Injectable } from '@angular/core';
import { BaseGetOrder } from './base-get-order';

@Injectable()
export class GetOrderPendingListService extends BaseGetOrder {
  protected override get ORDER_STATUS() {
    return 'Pending' as const;
  }
}
