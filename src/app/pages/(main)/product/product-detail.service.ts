import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  combineLatest,
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
import { NavigationService } from 'src/app/shared/navigation.service';
import {
  convertToURLFormat,
  showError,
  transformProductImageObjects,
} from 'src/app/shared/utils';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);
  private navigationService = inject(NavigationService);

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

  private queryParams$ = this.route.queryParams.pipe(
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
    map((product) =>
      product === null ? null : transformProductImageObjects(product),
    ),
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

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  private variationNames$ = this.productSuccess$.pipe(
    map((product) =>
      product
        ? Object.keys(product.variations).map((key) => convertToURLFormat(key))
        : [],
    ),
  );

  private currentVariation$ = combineLatest([
    this.variationNames$,
    this.queryParams$,
  ]).pipe(
    map(([names, queryParams]) =>
      names.map((name) => ({
        [name]: queryParams[name] as string | undefined,
      })),
    ),
  );

  private currentItem$ = combineLatest([
    this.currentVariation$,
    this.productSuccess$,
  ]).pipe(
    map(([variations, product]) => {
      const hasUndefinedVariations = variations.some((variation) =>
        Object.values(variation).some((value) => value === undefined),
      );

      if (product && variations.length > 0 && !hasUndefinedVariations) {
        return product.items.find((item) =>
          variations.every((variation) => {
            const [variationName, variationValue] =
              Object.entries(variation)[0];

            return item.variations.some(
              (itemVariation) =>
                variationValue &&
                convertToURLFormat(itemVariation.name) === variationName &&
                convertToURLFormat(itemVariation.value) === variationValue,
            );
          }),
        );
      }
      return null;
    }),
  );

  product = toSignal(this.productSuccess$, { initialValue: null });

  currentItem = toSignal(this.currentItem$, { initialValue: null });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.productError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  updateProductVariation(key: string, value: string): void {
    this.navigationService.setCustomParam(
      convertToURLFormat(key),
      convertToURLFormat(value),
    );
  }
}
