import { Injectable } from '@angular/core';
import { BaseGetOrder } from './base-get-order';

@Injectable({
  providedIn: 'root',
})
export class GetOrderToShipListService extends BaseGetOrder {
  constructor() {
    super();
    this.ORDER_STATUS = 'Processed';
  }
}
