import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { GetOrderToShipListService } from '../data-access/get-order-to-ship-list.service';
import { UpdateOrderStatusService } from '../data-access/update-order-status.service';
import { EmptyOrderListsComponent } from '../ui/empty-order-lists.component';
import { OrderToShipCardComponent } from '../ui/order-to-ship-card.component';

@Component({
  selector: 'app-order-to-ship-list',
  imports: [
    HlmNumberedPaginationComponent,
    OrderToShipCardComponent,
    EmptyOrderListsComponent,
  ],
  providers: [GetOrderToShipListService],
  template: `
    <div class="flex flex-col gap-4">
      @for (order of orders(); track order.id) {
        <app-order-to-ship-card
          [order]="order"
          (updateEmit)="proceedToReceive($event)"
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
export class OrderToShipListComponent {
  private getOrderService = inject(GetOrderToShipListService);
  private updateOrderStatusService = inject(UpdateOrderStatusService);

  protected page = this.getOrderService.page;
  protected pageSize = this.getOrderService.pageSize;
  protected totalOrders = this.getOrderService.totalOrders;
  protected orders = this.getOrderService.orders;
  protected isInitialLoading = this.getOrderService.isInitialLoading;

  protected setPage(page: number): void {
    this.getOrderService.setPage(page);
  }

  protected proceedToReceive(orderId: number): void {
    this.updateOrderStatusService.updateOrderStatus({
      orderId,
      status: 'Shipped',
    });
  }
}
