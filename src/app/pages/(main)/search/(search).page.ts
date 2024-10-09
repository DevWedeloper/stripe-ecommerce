import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { hlmH1 } from '@spartan-ng/ui-typography-helm';
import { NavigationService } from 'src/app/shared/navigation.service';
import { ProductCardComponent } from 'src/app/shared/product-card/product-card.component';
import { ProductCardListSkeletonComponent } from 'src/app/shared/product-card/skeleton/product-card-list-skeleton.component';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    HlmNumberedPaginationComponent,
    ProductCardComponent,
    ProductCardListSkeletonComponent,
  ],
  template: `
    <h1 class="${hlmH1} mb-4 text-center">
      Products related to "{{ keyword() }}"
    </h1>
    @if (!isInitialLoading()) {
      <div
        class="grid animate-fade-in grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" />
        } @empty {
          <div>No products found</div>
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
