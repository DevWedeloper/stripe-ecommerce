import { RouteMeta } from '@analogjs/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  HlmBreadcrumbDirective,
  HlmBreadcrumbLinkDirective,
  HlmBreadcrumbListDirective,
  HlmBreadcrumbPageDirective,
  HlmBreadcrumbSeparatorComponent,
} from '@spartan-ng/ui-breadcrumb-helm';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { hlmH1 } from '@spartan-ng/ui-typography-helm';
import { filter, startWith } from 'rxjs';
import { NavigationService } from 'src/app/shared/data-access/navigation.service';
import { EmptyProductListsComponent } from 'src/app/shared/ui/fallback/empty-product-lists.component';
import { ProductCardComponent } from 'src/app/shared/ui/product-card/product-card.component';
import { ProductCardListSkeletonComponent } from 'src/app/shared/ui/product-card/skeleton/product-card-list-skeleton.component';
import { parseToPositiveInt } from 'src/app/shared/utils/schema';
import { ProductListsService } from './data-access/product-lists.service';

export const routeMeta: RouteMeta = {
  providers: [ProductListsService],
};

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    HlmBreadcrumbDirective,
    HlmBreadcrumbListDirective,
    HlmBreadcrumbLinkDirective,
    HlmBreadcrumbPageDirective,
    HlmBreadcrumbSeparatorComponent,
    HlmNumberedPaginationComponent,
    ProductCardComponent,
    ProductCardListSkeletonComponent,
    EmptyProductListsComponent,
  ],
  template: `
    <h1 class="${hlmH1} mb-4 text-center">
      Products from "{{ categoryName() }}"
    </h1>
    <nav hlmBreadcrumb class="mb-4">
      <ol hlmBreadcrumbList>
        @for (item of breadcrumbPaths(); track $index) {
          @if (!$last) {
            <li hlmBreadcrumbItem>
              <a hlmBreadcrumbLink [link]="item.path">{{ item.title }}</a>
            </li>
          } @else {
            <li hlmBreadcrumbItem>
              <a hlmBreadcrumbPage>{{ item.title }}</a>
            </li>
          }
          @if ($index < breadcrumbPaths().length - 1) {
            <li hlmBreadcrumbSeparator></li>
          }
        }
      </ol>
    </nav>
    @if (!isInitialLoading()) {
      @if (products().length > 0) {
        <div
          class="grid animate-fade-in grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          @for (product of products(); track product.id) {
            <app-product-card
              [product]="product"
              [path]="'/product/' + product.id"
            />
          }
        </div>
        <hlm-numbered-pagination
          [currentPage]="page()"
          [itemsPerPage]="pageSize()"
          [totalItems]="totalProducts()"
          (currentPageChange)="setPage($event)"
          (itemsPerPageChange)="setPageSize($event)"
        />
      } @else {
        <div class="flex items-center justify-center">
          <app-empty-product-lists />
        </div>
      }
    } @else {
      <app-product-card-list-skeleton />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CategoryPageComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productListsService = inject(ProductListsService);
  private navigationService = inject(NavigationService);

  protected categoryName = this.productListsService.categoryName;

  protected page = this.productListsService.page;
  protected pageSize = this.productListsService.pageSize;
  protected totalProducts = this.productListsService.totalProducts;
  protected products = this.productListsService.products;
  protected breadcrumbPaths = this.productListsService.breadcrumbPaths;
  protected isInitialLoading = this.productListsService.isInitialLoading;

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(undefined),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const urlSegment = this.router.url
          .split('?')[0]
          .split('/')
          .filter((segment) => segment.trim() !== '');

        this.productListsService.setUrlSegments(urlSegment);
      });

    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe((queryParams) => {
        const { page, pageSize } = queryParams;
        const pageValue = parseToPositiveInt(page, 1);
        const pageSizeValue = parseToPositiveInt(pageSize, 10);

        this.productListsService.setPagination(pageValue, pageSizeValue);
      });
  }

  protected setPage(page: number): void {
    this.navigationService.setPage(page);
  }

  protected setPageSize(pageSize: number): void {
    this.navigationService.setPageSize(pageSize);
  }
}
