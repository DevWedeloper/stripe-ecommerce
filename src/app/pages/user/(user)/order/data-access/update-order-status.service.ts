import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { share, Subject } from 'rxjs';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { OrderStatusEnum } from 'src/db/schema';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class UpdateOrderStatusService {
  private _trpc = inject(TrpcClient);

  private updateOrderStatusTrigger$ = new Subject<{
    orderId: number;
    status: OrderStatusEnum;
  }>();

  private updateOrderStatus$ = this.updateOrderStatusTrigger$.pipe(
    materializeAndShare((data) => this._trpc.orders.updateStatus.mutate(data)),
  );

  updateOrderStatusSuccess$ = this.updateOrderStatus$.pipe(successStream());

  private updateOrderStatusError$ = this.updateOrderStatus$.pipe(
    errorStream(),
    share(),
  );

  private status$ = statusStream({
    loading: this.updateOrderStatusTrigger$,
    success: this.updateOrderStatusSuccess$,
    error: this.updateOrderStatusError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.updateOrderStatusError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  updateOrderStatus(data: { orderId: number; status: OrderStatusEnum }): void {
    this.updateOrderStatusTrigger$.next(data);
  }
}
