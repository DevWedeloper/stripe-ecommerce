import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, map, share, shareReplay } from 'rxjs';
import { NavigationService } from 'src/app/shared/data-access/navigation.service';
import { transformProductImageObjects } from 'src/app/shared/utils/image-object';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { convertToURLFormat } from 'src/app/shared/utils/url';
import { TrpcClient } from 'src/trpc-client';

@Injectable()
export class ProductDetailService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);
  private PLATFORM_ID = inject(PLATFORM_ID);
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
    pendingUntilEvent(),
    materializeAndShare((id) => this._trpc.products.getById.query(id)),
  );

  private productSuccess$ = this.product$.pipe(
    successStream(),
    map((product) =>
      product === null ? null : transformProductImageObjects(product),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private productError$ = this.product$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.productId$,
    success: this.productSuccess$,
    error: this.productError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  private variationNames$ = this.productSuccess$.pipe(
    map((product) =>
      product
        ? product.variations.map((variation) =>
            convertToURLFormat(variation.variation),
          )
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
      .pipe(
        filter(() => isPlatformBrowser(this.PLATFORM_ID)),
        takeUntilDestroyed(),
      )
      .subscribe((error) => showError(error.message));
  }

  updateProductVariation(key: string, value: string): void {
    this.navigationService.setCustomParam(
      convertToURLFormat(key),
      convertToURLFormat(value),
    );
  }
}
