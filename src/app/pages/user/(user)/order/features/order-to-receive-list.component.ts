import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { GetOrderToReceiveListService } from '../data-access/get-order-to-receive-list.service';
import { UpdateOrderStatusService } from '../data-access/update-order-status.service';
import { EmptyOrderListsComponent } from '../ui/empty-order-lists.component';
import { OrderToReceiveCardComponent } from '../ui/order-to-receive-card.component';

@Component({
  selector: 'app-order-to-receive-list',
  imports: [
    HlmNumberedPaginationComponent,
    OrderToReceiveCardComponent,
    EmptyOrderListsComponent,
  ],
  providers: [GetOrderToReceiveListService],
  template: `
    <div class="flex flex-col gap-4">
      @for (order of orders(); track order.id) {
        <app-order-to-receive-card
          [order]="order"
          (updateEmit)="proceedToCompleted($event)"
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
export class OrderToReceiveListComponent {
  private getOrderService = inject(GetOrderToReceiveListService);
  private updateOrderStatusService = inject(UpdateOrderStatusService);

  protected page = this.getOrderService.page;
  protected pageSize = this.getOrderService.pageSize;
  protected totalOrders = this.getOrderService.totalOrders;
  protected orders = this.getOrderService.orders;
  protected isInitialLoading = this.getOrderService.isInitialLoading;

  protected setPage(page: number): void {
    this.getOrderService.setPage(page);
  }

  protected proceedToCompleted(orderId: number): void {
    this.updateOrderStatusService.updateOrderStatus({
      orderId,
      status: 'Delivered',
    });
  }
}
