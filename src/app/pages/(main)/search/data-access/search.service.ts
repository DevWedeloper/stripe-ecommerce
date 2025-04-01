import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, filter, map, share, shareReplay } from 'rxjs';
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

@Injectable()
export class SearchService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);
  private PLATFORM_ID = inject(PLATFORM_ID);

  private filter$ = this.route.queryParams.pipe(
    map((queryParams) => {
      const { keyword, page, pageSize } = queryParams;

      const keywordValue = keyword ? String(keyword) : '';
      const pageValue = parseToPositiveInt(page, 1);
      const pageSizeValue = parseToPositiveInt(pageSize, 10);

      return {
        keyword: keywordValue,
        page: pageValue,
        pageSize: pageSizeValue,
      };
    }),
    filter((filter) => filter.keyword !== ''),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private keyword$ = this.filter$.pipe(map((filter) => filter.keyword));

  private products$ = this.filter$.pipe(
    pendingUntilEvent(),
    materializeAndShare((keywordFilter) =>
      this._trpc.products.searchByKeyword.query(keywordFilter),
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

  keyword = toSignal(this.keyword$, { initialValue: '' });

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
