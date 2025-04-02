import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, map, merge, share, Subject } from 'rxjs';
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
export class DeleteProductService {
  private _trpc = inject(TrpcClient);
  private router = inject(Router);

  private deleteProductTrigger$ = new Subject<number>();

  private deleteProduct$ = this.deleteProductTrigger$.pipe(
    materializeAndShare((productId) =>
      this._trpc.products.deleteByUserId.mutate({ productId }),
    ),
  );

  private deleteProductSuccess$ = this.deleteProduct$.pipe(
    successStream(),
    share(),
  );

  deleteProductSuccessWithData$ = this.deleteProductSuccess$.pipe(
    filter((data) => data.error === null),
    share(),
  );

  private deleteProductSuccessWithError$ = this.deleteProductSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private deleteProductError$ = this.deleteProduct$.pipe(
    errorStream(),
    share(),
  );

  private error$ = merge(
    this.deleteProductSuccessWithError$,
    this.deleteProductError$,
  ).pipe(share());

  private status$ = statusStream({
    loading: this.deleteProductTrigger$,
    success: this.deleteProductSuccess$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.deleteProductSuccessWithData$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.router.navigate(['/user/product']));

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  deleteProduct(productId: number): void {
    this.deleteProductTrigger$.next(productId);
  }
}
