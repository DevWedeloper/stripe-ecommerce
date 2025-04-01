import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { GetOrderCompletedListService } from '../data-access/get-order-completed-list.service';
import { EmptyOrderListsComponent } from '../ui/empty-order-lists.component';
import { OrderCompletedCardComponent } from '../ui/order-completed-card.component';
import { ConfirmDeleteReviewDialogComponent } from './review/confirm-delete-review-dialog.component';
import { EditReviewDialogComponent } from './review/edit-review-dialog.component';
import { WriteReviewDialogComponent } from './review/write-review-dialog.component';

@Component({
  selector: 'app-order-completed-list',
  imports: [
    HlmNumberedPaginationComponent,
    OrderCompletedCardComponent,
    EmptyOrderListsComponent,
  ],
  providers: [GetOrderCompletedListService],
  template: `
    <div class="flex flex-col gap-4">
      @for (order of orders(); track order.id) {
        <app-order-completed-card
          [order]="order"
          (writeReview)="writeReview($event)"
          (editReview)="editReview($event)"
          (deleteReview)="deleteReview($event)"
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
export class OrderCompletedListComponent {
  private _hlmDialogService = inject(HlmDialogService);
  private getOrderService = inject(GetOrderCompletedListService);

  protected page = this.getOrderService.page;
  protected pageSize = this.getOrderService.pageSize;
  protected totalOrders = this.getOrderService.totalOrders;
  protected orders = this.getOrderService.orders;
  protected isInitialLoading = this.getOrderService.isInitialLoading;

  protected setPage(page: number): void {
    this.getOrderService.setPage(page);
  }

  protected writeReview(orderItemId: number): void {
    this._hlmDialogService.open(WriteReviewDialogComponent, {
      contentClass: 'flex',
      context: { orderItemId },
    });
  }

  protected editReview(orderItemId: number): void {
    this._hlmDialogService.open(EditReviewDialogComponent, {
      contentClass: 'flex',
      context: { orderItemId },
    });
  }

  protected deleteReview(orderItemId: number): void {
    this._hlmDialogService.open(ConfirmDeleteReviewDialogComponent, {
      contentClass: 'flex',
      context: { orderItemId },
    });
  }
}
