import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { GetOrderPendingListService } from '../data-access/get-order-pending-list.service';
import { UpdateOrderStatusService } from '../data-access/update-order-status.service';
import { EmptyOrderListsComponent } from '../ui/empty-order-lists.component';
import { OrderPendingCardComponent } from '../ui/order-pending-card.component';

@Component({
  selector: 'app-order-pending-list',
  imports: [
    HlmNumberedPaginationComponent,
    OrderPendingCardComponent,
    EmptyOrderListsComponent,
  ],
  providers: [GetOrderPendingListService],
  template: `
    <div class="flex flex-col gap-4">
      @for (order of orders(); track order.id) {
        <app-order-pending-card
          [order]="order"
          (updateEmit)="proceedToShip($event)"
          (cancelEmit)="cancelOrder($event)"
        />
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
export class OrderPendingListComponent {
  private getOrderService = inject(GetOrderPendingListService);
  private updateOrderStatusService = inject(UpdateOrderStatusService);

  protected page = this.getOrderService.page;
  protected pageSize = this.getOrderService.pageSize;
  protected totalOrders = this.getOrderService.totalOrders;
  protected orders = this.getOrderService.orders;
  protected isInitialLoading = this.getOrderService.isInitialLoading;

  protected setPage(page: number): void {
    this.getOrderService.setPage(page);
  }

  protected cancelOrder(orderId: number): void {
    this.updateOrderStatusService.updateOrderStatus({
      orderId,
      status: 'Cancelled',
    });
  }

  protected proceedToShip(orderId: number): void {
    this.updateOrderStatusService.updateOrderStatus({
      orderId,
      status: 'Processed',
    });
  }
}
