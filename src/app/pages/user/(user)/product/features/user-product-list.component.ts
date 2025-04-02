import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { NavigationService } from 'src/app/shared/data-access/navigation.service';
import { EmptyProductListsComponent } from 'src/app/shared/ui/fallback/empty-product-lists.component';
import { ProductCardComponent } from 'src/app/shared/ui/product-card/product-card.component';
import { ProductCardListSkeletonComponent } from 'src/app/shared/ui/product-card/skeleton/product-card-list-skeleton.component';
import { UserProductListService } from '../data-access/user-product-list.service';

@Component({
  selector: 'app-user-product-list',
  imports: [
    HlmNumberedPaginationComponent,
    ProductCardComponent,
    ProductCardListSkeletonComponent,
    EmptyProductListsComponent,
  ],
  providers: [UserProductListService],
  template: `
    @if (!isInitialLoading()) {
      @if (products().length > 0) {
        <div
          class="grid animate-fade-in grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          @for (product of products(); track product.id) {
            <app-product-card
              [product]="product"
              [path]="'/user/product/' + product.id"
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
export class UserProductListComponent {
  private productListService = inject(UserProductListService);
  private navigationService = inject(NavigationService);

  protected page = this.productListService.page;
  protected pageSize = this.productListService.pageSize;
  protected totalProducts = this.productListService.totalProducts;
  protected products = this.productListService.products;
  protected isInitialLoading = this.productListService.isInitialLoading;

  protected setPage(page: number): void {
    this.navigationService.setPage(page);
  }

  protected setPageSize(pageSize: number): void {
    this.navigationService.setPageSize(pageSize);
  }
}
