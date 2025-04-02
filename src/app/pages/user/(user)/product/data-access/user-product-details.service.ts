import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filter, map, share, shareReplay } from 'rxjs';
import {
  errorStream,
  finalizedStatusStream,
  initialLoading,
  materializeAndShare,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { TrpcClient } from 'src/trpc-client';
import { mapProductToFormData } from '../../../../../../utils/product';

@Injectable()
export class UserProductDetailsService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);
  private PLATFORM_ID = inject(PLATFORM_ID);

  private productId$ = this.route.params.pipe(
    map((params) => {
      const { productId } = params;
      const id = Number(productId);

      if (isNaN(id)) {
        throw new Error('Not a valid ID');
      }

      return id;
    }),
  );

  private product$ = this.productId$.pipe(
    pendingUntilEvent(),
    materializeAndShare((productId) =>
      this._trpc.products.getByUserId.query({
        productId,
      }),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  productSuccess$ = this.product$.pipe(successStream());

  private productError$ = this.product$.pipe(errorStream(), share());

  private status$ = finalizedStatusStream({
    success: this.productSuccess$,
    error: this.productError$,
  });

  private initialLoading$ = this.status$.pipe(initialLoading());

  product = toSignal(this.productSuccess$, { initialValue: null });

  isInitialLoading = toSignal(this.initialLoading$, { initialValue: true });

  initialFormData = computed(() => {
    const product = this.product();
    return product ? mapProductToFormData(product) : null;
  });

  constructor() {
    this.productError$
      .pipe(
        filter(() => isPlatformBrowser(this.PLATFORM_ID)),
        takeUntilDestroyed(),
      )
      .subscribe((error) => showError(error.message));
  }
}
