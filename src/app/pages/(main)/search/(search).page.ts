import { RouteMeta } from '@analogjs/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { hlmH1 } from '@spartan-ng/ui-typography-helm';
import { NavigationService } from 'src/app/shared/data-access/navigation.service';
import { EmptyProductListsComponent } from 'src/app/shared/ui/fallback/empty-product-lists.component';
import { ProductCardComponent } from 'src/app/shared/ui/product-card/product-card.component';
import { ProductCardListSkeletonComponent } from 'src/app/shared/ui/product-card/skeleton/product-card-list-skeleton.component';
import { metaWith } from 'src/app/shared/utils/meta';
import { SearchService } from './data-access/search.service';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Search',
    'Browse through a wide range of products based on your search.',
  ),
  title: 'Stripe Ecommerce | Search',
};

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    HlmNumberedPaginationComponent,
    ProductCardComponent,
    ProductCardListSkeletonComponent,
    EmptyProductListsComponent,
  ],
  template: `
    <h1 class="${hlmH1} mb-4 text-center">
      Products related to "{{ keyword() }}"
    </h1>
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
export default class SearchPageComponent {
  private searchService = inject(SearchService);
  private navigationService = inject(NavigationService);

  protected keyword = this.searchService.keyword;
  protected page = this.searchService.page;
  protected pageSize = this.searchService.pageSize;
  protected totalProducts = this.searchService.totalProducts;
  protected products = this.searchService.products;
  protected isInitialLoading = this.searchService.isInitialLoading;

  protected setPage(page: number): void {
    this.navigationService.setPage(page);
  }

  protected setPageSize(pageSize: number): void {
    this.navigationService.setPageSize(pageSize);
  }
}
