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
import { TrpcClient } from 'src/trpc-client';

@Injectable()
export class GetReviewService {
  private _trpc = inject(TrpcClient);

  private getReviewTrigger$ = new Subject<number>();

  private getReview$ = this.getReviewTrigger$.pipe(
    materializeAndShare((orderItemId) =>
      this._trpc.reviews.getByOrderItemId.query({ orderItemId }),
    ),
  );

  getReviewSuccess$ = this.getReview$.pipe(successStream(), share());

  private getReviewError$ = this.getReview$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.getReviewTrigger$,
    success: this.getReviewSuccess$,
    error: this.getReviewError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  review = toSignal(this.getReviewSuccess$, { initialValue: null });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.getReviewError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  getReview(orderItemId: number): void {
    this.getReviewTrigger$.next(orderItemId);
  }
}
