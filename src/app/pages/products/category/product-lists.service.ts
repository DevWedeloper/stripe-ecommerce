import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  combineLatest,
  dematerialize,
  distinctUntilChanged,
  filter,
  map,
  materialize,
  merge,
  share,
  startWith,
  switchMap,
  take,
} from 'rxjs';
import {
  parseToPositiveInt,
  showError,
  transformProductImagePathsAndPlaceholders,
} from 'src/app/shared/utils';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class ProductListsService {
  private route = inject(ActivatedRoute);
  private _trpc = inject(TrpcClient);

  private filter$ = combineLatest([
    this.route.params,
    this.route.queryParams,
  ]).pipe(
    map(([params, queryParams]) => {
      const { categoryName } = params;
      const { page, pageSize } = queryParams;

      const pageValue = parseToPositiveInt(page, 1);
      const pageSizeValue = parseToPositiveInt(pageSize, 10);
      const name = String(categoryName) || '';

      return { name, page: pageValue, pageSize: pageSizeValue };
    }),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    share(),
  );

  private products$ = this.filter$.pipe(
    switchMap((categoryFilter) =>
      this._trpc.products.getByCategoryName.query(categoryFilter),
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
