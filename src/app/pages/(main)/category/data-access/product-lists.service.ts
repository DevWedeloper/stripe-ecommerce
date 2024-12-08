import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, distinctUntilChanged, map, share } from 'rxjs';
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
    materializeAndShare((categoryFilter) =>
      this._trpc.products.getByCategoryName.query(categoryFilter),
    ),
  );

  private productsSuccess$ = this.products$.pipe(
    successStream(),
    map(transformProductImagePathsAndPlaceholders),
    share(),
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
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }
}
