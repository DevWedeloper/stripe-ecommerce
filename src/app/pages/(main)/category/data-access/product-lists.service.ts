import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  share,
  shareReplay,
  startWith,
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
import { toTitleCase } from 'src/utils/string-format';

@Injectable()
export class ProductListsService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _trpc = inject(TrpcClient);
  private PLATFORM_ID = inject(PLATFORM_ID);

  private urlSegments$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(undefined),
    map(() =>
      this.router.url.split('/').filter((segment) => segment.trim() !== ''),
    ),
    filter((urlSegments) => urlSegments.length > 0),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private breadcrumbPaths$ = this.urlSegments$.pipe(
    map((pathArray) => {
      const generatePaths = (arr: string[]): string[] =>
        arr.reduce((paths, current, index) => {
          const path =
            index === 0 ? `/${current}` : `${paths[index - 1]}/${current}`;
          paths.push(path);
          return paths;
        }, [] as string[]);

      const generatedPaths = generatePaths(pathArray);

      const formattedTitles = pathArray.map(toTitleCase);

      const result = generatedPaths.map((generatedPath, index) => ({
        title: formattedTitles[index],
        path: generatedPath,
      }));

      return result;
    }),
  );

  private categoryName$ = this.urlSegments$.pipe(
    map((segments) => segments.at(-1) || ''),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private filter$ = combineLatest([
    this.route.queryParams,
    this.categoryName$,
  ]).pipe(
    map(([queryParams, name]) => {
      const { page, pageSize } = queryParams;

      const pageValue = parseToPositiveInt(page, 1);
      const pageSizeValue = parseToPositiveInt(pageSize, 10);

      return { name, page: pageValue, pageSize: pageSizeValue };
    }),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
  );

  private products$ = this.filter$.pipe(
    pendingUntilEvent(),
    materializeAndShare((categoryFilter) =>
      this._trpc.products.getByCategoryName.query(categoryFilter),
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

  categoryName = toSignal(this.categoryName$, {
    initialValue: '',
  });

  page = computed(() => this.productData().page);
  pageSize = computed(() => this.productData().pageSize);
  totalProducts = computed(() => this.productData().totalProducts);
  products = computed(() => this.productData().products);

  breadcrumbPaths = toSignal(this.breadcrumbPaths$, { initialValue: [] });

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
