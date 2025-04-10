import { Injectable } from '@angular/core';
import { BaseGetOrder } from './base-get-order';

@Injectable()
export class GetOrderToReceiveListService extends BaseGetOrder {
  protected override get ORDER_STATUS() {
    return 'Shipped' as const;
  }
}
