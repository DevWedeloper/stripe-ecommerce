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

@Injectable({
  providedIn: 'root',
})
export class DeleteReviewService {
  private _trpc = inject(TrpcClient);

  private deleteReviewTrigger$ = new Subject<number>();

  private deleteReview$ = this.deleteReviewTrigger$.pipe(
    materializeAndShare((orderItemId) =>
      this._trpc.reviews.delete.mutate({ orderItemId }),
    ),
  );

  deleteReviewSuccess$ = this.deleteReview$.pipe(successStream(), share());

  private deleteReviewError$ = this.deleteReview$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.deleteReviewTrigger$,
    success: this.deleteReviewSuccess$,
    error: this.deleteReviewError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.deleteReviewError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  deleteReview(orderItemId: number): void {
    this.deleteReviewTrigger$.next(orderItemId);
  }
}
