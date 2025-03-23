import { Injectable } from '@angular/core';
import { BaseGetOrder } from './base-get-order';

@Injectable({
  providedIn: 'root',
})
export class GetOrderPendingListService extends BaseGetOrder {
  constructor() {
    super();
    this.ORDER_STATUS = 'Pending';
  }
}
