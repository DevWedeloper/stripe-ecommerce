import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, merge, share, Subject } from 'rxjs';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { CreateReviewSchema } from 'src/schemas/review';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class CreateReviewService {
  private _trpc = inject(TrpcClient);

  private createReviewTrigger$ = new Subject<CreateReviewSchema>();

  private createReview$ = this.createReviewTrigger$.pipe(
    materializeAndShare((data) => this._trpc.reviews.create.mutate(data)),
  );

  private createReviewSuccess$ = this.createReview$.pipe(
    successStream(),
    share(),
  );

  createReviewSuccessWithData$ = this.createReviewSuccess$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
    share(),
  );

  private createReviewSuccessWithError$ = this.createReviewSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private createReviewError$ = this.createReview$.pipe(errorStream());

  error$ = merge(
    this.createReviewSuccessWithError$,
    this.createReviewError$,
  ).pipe(share());

  private status$ = statusStream({
    loading: this.createReviewTrigger$,
    success: this.createReviewSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  createReview(data: CreateReviewSchema): void {
    this.createReviewTrigger$.next(data);
  }
}
