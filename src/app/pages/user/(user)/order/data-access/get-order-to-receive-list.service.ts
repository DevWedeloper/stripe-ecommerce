import { Injectable } from '@angular/core';
import { BaseGetOrder } from './base-get-order';

@Injectable()
export class GetOrderToReceiveListService extends BaseGetOrder {
  constructor() {
    super();
    this.ORDER_STATUS = 'Shipped';
  }
}
