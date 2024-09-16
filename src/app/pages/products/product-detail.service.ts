import { computed, effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  dematerialize,
  filter,
  map,
  materialize,
  merge,
  share,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { showError } from 'src/app/shared/utils';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailService {
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

  private product$ = this.productId$.pipe(
    switchMap((id) => this._trpc.products.getById.query(id)),
    materialize(),
    share(),
  );

  private productSuccess$ = this.product$.pipe(
    filter((notification) => notification.kind === 'N'),
    dematerialize(),
    share(),
  );

  private productError$ = this.product$.pipe(
    filter((notification) => notification.kind === 'E'),
    map((notification) => new Error(notification.error)),
    share(),
  );

  private status$ = merge(
    this.productId$.pipe(map(() => 'loading' as const)),
    this.productSuccess$.pipe(map(() => 'success' as const)),
    this.productError$.pipe(map(() => 'error' as const)),
  ).pipe(startWith('initial' as const));

  private error = toSignal(this.productError$, { initialValue: null });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  private hasError = computed(() => this.status() === 'error');

  private errorMessage = computed(() => this.error()?.message);

  product = toSignal(this.productSuccess$, { initialValue: null });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    effect(
      () => {
        if (this.hasError() && this.errorMessage())
          showError(this.errorMessage()!);
      },
      { allowSignalWrites: true },
    );
  }
}
