import { RouteMeta } from '@analogjs/router';
import { Component } from '@angular/core';
import {
  HlmTabsComponent,
  HlmTabsContentDirective,
  HlmTabsListComponent,
  HlmTabsTriggerDirective,
} from '@spartan-ng/ui-tabs-helm';
import { metaWith } from 'src/app/shared/utils/meta';
import { OrderAllListComponent } from './features/order-all-list.component';
import { OrderCancelledListComponent } from './features/order-cancelled-list.component';
import { OrderCompletedListComponent } from './features/order-completed-list.component';
import { OrderPendingListComponent } from './features/order-pending-list.component';
import { OrderToReceiveListComponent } from './features/order-to-receive-list.component';
import { OrderToShipListComponent } from './features/order-to-ship-list.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Order',
    'View your order history and track the status of your purchases.',
  ),
  title: 'Stripe Ecommerce | Order',
};

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    HlmTabsComponent,
    HlmTabsListComponent,
    HlmTabsTriggerDirective,
    HlmTabsContentDirective,
    OrderAllListComponent,
    OrderPendingListComponent,
    OrderToShipListComponent,
    OrderToReceiveListComponent,
    OrderCompletedListComponent,
    OrderCancelledListComponent,
  ],
  template: `
    <hlm-tabs tab="all" class="w-full">
      <hlm-tabs-list
        class="grid w-full grid-cols-6"
        aria-label="order type tabs"
      >
        <button hlmTabsTrigger="all">All</button>
        <button hlmTabsTrigger="pending">Pending</button>
        <button hlmTabsTrigger="to-ship">To Ship</button>
        <button hlmTabsTrigger="to-receive">To Receive</button>
        <button hlmTabsTrigger="completed">Completed</button>
        <button hlmTabsTrigger="cancelled">Cancelled</button>
      </hlm-tabs-list>
      <div hlmTabsContent="all">
        <app-order-all-list />
      </div>
      <div hlmTabsContent="pending">
        <app-order-pending-list />
      </div>
      <div hlmTabsContent="to-ship">
        <app-order-to-ship-list />
      </div>
      <div hlmTabsContent="to-receive">
        <app-order-to-receive-list />
      </div>
      <div hlmTabsContent="completed">
        <app-order-completed-list />
      </div>
      <div hlmTabsContent="cancelled">
        <app-order-cancelled-list />
      </div>
    </hlm-tabs>
  `,
})
export default class OrderPageComponent {}
