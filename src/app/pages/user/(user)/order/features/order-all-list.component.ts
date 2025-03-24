import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { GetOrderAllStatusListService } from '../data-access/get-order-all-status-list.service';
import { UpdateOrderStatusService } from '../data-access/update-order-status.service';
import { EmptyOrderListsComponent } from '../ui/empty-order-lists.component';
import { OrderCancelledCardComponent } from '../ui/order-cancelled-card.component';
import { OrderCompletedCardComponent } from '../ui/order-completed-card.component';
import { OrderPendingCardComponent } from '../ui/order-pending-card.component';
import { OrderToReceiveCardComponent } from '../ui/order-to-receive-card.component';
import { OrderToShipCardComponent } from '../ui/order-to-ship-card.component';

@Component({
  selector: 'app-order-all-list',
  imports: [
    HlmNumberedPaginationComponent,
    OrderPendingCardComponent,
    OrderToShipCardComponent,
    OrderToReceiveCardComponent,
    OrderCompletedCardComponent,
    OrderCancelledCardComponent,
    EmptyOrderListsComponent,
  ],
  template: `
    <div class="flex flex-col gap-4">
      @for (order of orders(); track order.id) {
        @switch (order.status) {
          @case ('Pending') {
            <app-order-pending-card
              [order]="order"
              (updateEmit)="proceedToShip($event)"
              (cancelEmit)="cancelOrder($event)"
            />
          }
          @case ('Processed') {
            <app-order-to-ship-card
              [order]="order"
              (updateEmit)="proceedToReceive($event)"
            />
          }
          @case ('Shipped') {
            <app-order-to-receive-card
              [order]="order"
              (updateEmit)="proceedToCompleted($event)"
            />
          }
          @case ('Delivered') {
            <app-order-completed-card [order]="order" />
          }
          @case ('Cancelled') {
            <app-order-cancelled-card [order]="order" />
          }
          @default {
            <p>Status not found: {{ order.status }}</p>
          }
        }
      } @empty {
        <app-empty-order-lists />
      }
    </div>
    <hlm-numbered-pagination
      [currentPage]="page()"
      [itemsPerPage]="pageSize()"
      [totalItems]="totalOrders()"
      [pageSizes]="[10]"
      (currentPageChange)="setPage($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderAllListComponent {
  private getOrderService = inject(GetOrderAllStatusListService);
  private updateOrderStatusService = inject(UpdateOrderStatusService);

  protected page = this.getOrderService.page;
  protected pageSize = this.getOrderService.pageSize;
  protected totalOrders = this.getOrderService.totalOrders;
  protected orders = this.getOrderService.orders;
  protected isInitialLoading = this.getOrderService.isInitialLoading;

  protected setPage(page: number): void {
    this.getOrderService.setPage(page);
  }

  protected proceedToShip(orderId: number): void {
    this.updateOrderStatusService.updateOrderStatus({
      orderId,
      status: 'Processed',
    });
  }

  protected proceedToReceive(orderId: number): void {
    this.updateOrderStatusService.updateOrderStatus({
      orderId,
      status: 'Shipped',
    });
  }

  protected proceedToCompleted(orderId: number): void {
    this.updateOrderStatusService.updateOrderStatus({
      orderId,
      status: 'Delivered',
    });
  }

  protected cancelOrder(orderId: number): void {
    this.updateOrderStatusService.updateOrderStatus({
      orderId,
      status: 'Cancelled',
    });
  }
}
