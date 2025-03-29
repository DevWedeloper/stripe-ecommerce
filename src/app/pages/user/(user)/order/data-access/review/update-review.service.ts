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
import { UpdateReviewSchema } from 'src/schemas/review';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class UpdateReviewService {
  private _trpc = inject(TrpcClient);

  private updateReviewTrigger$ = new Subject<UpdateReviewSchema>();

  private updateReview$ = this.updateReviewTrigger$.pipe(
    materializeAndShare((data) => this._trpc.reviews.update.mutate(data)),
  );

  updateReviewSuccess$ = this.updateReview$.pipe(successStream(), share());

  updateReviewError$ = this.updateReview$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.updateReviewTrigger$,
    success: this.updateReviewSuccess$,
    error: this.updateReviewError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.updateReviewError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  updateReview(data: UpdateReviewSchema): void {
    this.updateReviewTrigger$.next(data);
  }
}
