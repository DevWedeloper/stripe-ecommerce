import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  distinctUntilChanged,
  filter,
  map,
  merge,
  share,
  shareReplay,
  withLatestFrom,
} from 'rxjs';
import { transformProductImagePathsAndPlaceholders } from 'src/app/shared/utils/image-object';
import {
  errorStream,
  finalizedStatusStream,
  initialLoading,
  materializeAndShare,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { parseToPositiveInt } from 'src/app/shared/utils/schema';
import { showError } from 'src/app/shared/utils/toast';
import { TrpcClient } from 'src/trpc-client';
import { CreateProductService } from './create-product.service';

@Injectable({
  providedIn: 'root',
})
export class UserProductListService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);
  private PLATFORM_ID = inject(PLATFORM_ID);
  private createProductService = inject(CreateProductService);

  private filter$ = this.route.queryParams.pipe(
    map((queryParams) => {
      const { page, pageSize } = queryParams;
      const pageValue = parseToPositiveInt(page, 1);
      const pageSizeValue = parseToPositiveInt(pageSize, 10);

      return {
        page: pageValue,
        pageSize: pageSizeValue,
      };
    }),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
  );

  private trigger$ = merge(
    this.filter$,
    this.createProductService.createProductSuccess$,
  );

  private products$ = this.trigger$.pipe(
    pendingUntilEvent(),
    withLatestFrom(this.filter$),
    materializeAndShare(([_, filter]) =>
      this._trpc.products.getAllByUserId.query(filter),
    ),
  );

  private productsSuccess$ = this.products$.pipe(
    successStream(),
    map(transformProductImagePathsAndPlaceholders),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private productsError$ = this.products$.pipe(errorStream(), share());

  private status$ = finalizedStatusStream({
    success: this.productsSuccess$,
    error: this.productsError$,
  });

  private initialLoading$ = this.status$.pipe(initialLoading());

  private productData = toSignal(this.productsSuccess$, {
    initialValue: {
      page: 1,
      pageSize: 10,
      totalPages: 0,
      totalProducts: 0,
      products: [],
    },
  });

  page = computed(() => this.productData().page);
  pageSize = computed(() => this.productData().pageSize);
  totalProducts = computed(() => this.productData().totalProducts);
  products = computed(() => this.productData().products);

  isInitialLoading = toSignal(this.initialLoading$, { initialValue: true });

  constructor() {
    this.productsError$
      .pipe(
        filter(() => isPlatformBrowser(this.PLATFORM_ID)),
        takeUntilDestroyed(),
      )
      .subscribe((error) => showError(error.message));
  }
}
