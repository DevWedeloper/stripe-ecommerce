import { Injectable } from '@angular/core';
import { BaseGetOrder } from './base-get-order';

@Injectable()
export class GetOrderToShipListService extends BaseGetOrder {
  protected override get ORDER_STATUS() {
    return 'Processed' as const;
  }
}
