import { isPlatformBrowser } from '@angular/common';
import { computed, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  merge,
  share,
  shareReplay,
  withLatestFrom,
} from 'rxjs';
import {
  errorStream,
  finalizedStatusStream,
  initialLoading,
  materializeAndShare,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { OrderStatusEnum } from 'src/db/schema';
import { TrpcClient } from 'src/trpc-client';
import { CreateReviewService } from './review/create-review.service';
import { DeleteReviewService } from './review/delete-review.service';
import { UpdateReviewService } from './review/update-review.service';
import { UpdateOrderStatusService } from './update-order-status.service';

export class BaseGetOrder {
  private PLATFORM_ID = inject(PLATFORM_ID);
  private _trpc = inject(TrpcClient);
  protected updateOrderStatusService = inject(UpdateOrderStatusService);
  protected createReviewService = inject(CreateReviewService);
  protected updateReviewService = inject(UpdateReviewService);
  protected deleteReviewService = inject(DeleteReviewService);

  private PAGE_SIZE = 10;
  protected get ORDER_STATUS(): OrderStatusEnum | undefined {
    return undefined;
  }

  private page$ = new BehaviorSubject<number>(1);

  protected filter$ = this.page$.pipe(
    map((page) => ({
      page,
      pageSize: this.PAGE_SIZE,
      status: this.ORDER_STATUS,
    })),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
  );

  protected get trigger$() {
    return merge(
      this.filter$,
      this.updateOrderStatusService.updateOrderStatusSuccess$,
    );
  }

  private orders$ = this.trigger$.pipe(
    withLatestFrom(this.filter$),
    materializeAndShare(([_, { page, pageSize, status }]) =>
      this._trpc.orders.getByUserId.query({ page, pageSize, status }),
    ),
  );

  private ordersSuccess$ = this.orders$.pipe(
    successStream(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private ordersError$ = this.orders$.pipe(errorStream(), share());

  private status$ = finalizedStatusStream({
    success: this.ordersSuccess$,
    error: this.ordersError$,
  });

  private initialLoading$ = this.status$.pipe(initialLoading());

  private orderData = toSignal(this.ordersSuccess$, {
    initialValue: {
      page: 1,
      pageSize: 10,
      totalPages: 0,
      totalOrders: 0,
      orders: [],
    },
  });

  page = computed(() => this.orderData().page);
  pageSize = computed(() => this.orderData().pageSize);
  totalOrders = computed(() => this.orderData().totalOrders);
  orders = computed(() => this.orderData().orders);

  isInitialLoading = toSignal(this.initialLoading$, { initialValue: true });

  constructor() {
    this.ordersError$
      .pipe(
        filter(() => isPlatformBrowser(this.PLATFORM_ID)),
        takeUntilDestroyed(),
      )
      .subscribe((error) => showError(error.message));
  }

  setPage(page: number): void {
    this.page$.next(page);
  }
}
