import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { GetOrderCancelledListService } from '../data-access/get-order-cancelled-list.service';
import { EmptyOrderListsComponent } from '../ui/empty-order-lists.component';
import { OrderCancelledCardComponent } from '../ui/order-cancelled-card.component';

@Component({
  selector: 'app-order-cancelled-list',
  imports: [
    HlmNumberedPaginationComponent,
    OrderCancelledCardComponent,
    EmptyOrderListsComponent,
  ],
  providers: [GetOrderCancelledListService],
  template: `
    <div class="flex flex-col gap-4">
      @for (order of orders(); track order.id) {
        <app-order-cancelled-card [order]="order" />
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
export class OrderCancelledListComponent {
  private getOrderService = inject(GetOrderCancelledListService);

  protected page = this.getOrderService.page;
  protected pageSize = this.getOrderService.pageSize;
  protected totalOrders = this.getOrderService.totalOrders;
  protected orders = this.getOrderService.orders;
  protected isInitialLoading = this.getOrderService.isInitialLoading;

  protected setPage(page: number): void {
    this.getOrderService.setPage(page);
  }
}
