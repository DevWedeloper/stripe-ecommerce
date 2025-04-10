import { Injectable } from '@angular/core';
import { BaseGetOrder } from './base-get-order';

@Injectable()
export class GetOrderCancelledListService extends BaseGetOrder {
  protected override get ORDER_STATUS() {
    return 'Cancelled' as const;
  }
}
