import { inject, Injectable } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, materialize, share, shareReplay, switchMap } from 'rxjs';
import { TrpcClient } from 'src/trpc-client';
import { errorStream, successStream } from '../../../../../shared/utils/rxjs';
import { showError } from '../../../../../shared/utils/toast';

@Injectable()
export class GetRatingDetailsService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);

  private productId$ = this.route.params.pipe(
    map((params) => {
      const { productId } = params;
      const id = Number(productId);

      if (isNaN(id)) {
        throw new Error('Not a valid ID');
      }

      return id;
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private getRatingDetails$ = this.productId$.pipe(
    pendingUntilEvent(),
    switchMap((productId) =>
      this._trpc.reviews.getRatingDetails.query({ productId }),
    ),
    materialize(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private getRatingDetailsSuccess$ = this.getRatingDetails$.pipe(
    successStream(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private getRatingDetailsError$ = this.getRatingDetails$.pipe(
    errorStream(),
    share(),
  );

  ratingDetails = toSignal(this.getRatingDetailsSuccess$, { initialValue: [] });

  constructor() {
    this.getRatingDetailsError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }
}
