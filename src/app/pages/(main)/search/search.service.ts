import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  dematerialize,
  distinctUntilChanged,
  filter,
  map,
  materialize,
  merge,
  share,
  shareReplay,
  startWith,
  switchMap,
  take,
} from 'rxjs';
import { parseToPositiveInt } from 'src/app/shared/utils';
import { transformProductImagePathsAndPlaceholders } from 'src/app/shared/utils/image-object';
import { showError } from 'src/app/shared/utils/toast';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);

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
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private keyword$ = this.filter$.pipe(map((filter) => filter.keyword));

  private products$ = this.filter$.pipe(
    switchMap((keywordFilter) =>
      this._trpc.products.searchByKeyword.query(keywordFilter),
    ),
    materialize(),
    share(),
  );

  private productsSuccess$ = this.products$.pipe(
    filter((notification) => notification.kind === 'N'),
    dematerialize(),
    map(transformProductImagePathsAndPlaceholders),
    share(),
  );

  private productsError$ = this.products$.pipe(
    filter((notification) => notification.kind === 'E'),
    map((notification) => new Error(notification.error)),
    share(),
  );

  private successAndErrorStatus$ = merge(
    this.productsSuccess$.pipe(map(() => 'success' as const)),
    this.productsError$.pipe(map(() => 'error' as const)),
  ).pipe(share());

  private initialLoading$ = this.successAndErrorStatus$.pipe(
    map(() => false),
    take(1),
    startWith(true),
  );

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
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }
}
