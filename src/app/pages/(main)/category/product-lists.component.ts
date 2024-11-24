import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { hlmH1 } from '@spartan-ng/ui-typography-helm';
import { EmptyProductListsComponent } from 'src/app/shared/ui/fallback/empty-product-lists.component';
import { NavigationService } from 'src/app/shared/navigation.service';
import { ProductCardComponent } from 'src/app/shared/product-card/product-card.component';
import { ProductCardListSkeletonComponent } from 'src/app/shared/product-card/skeleton/product-card-list-skeleton.component';
import { ProductListsService } from './data-access/product-lists.service';

@Component({
  selector: 'app-product-lists',
  standalone: true,
  imports: [
    HlmNumberedPaginationComponent,
    ProductCardComponent,
    ProductCardListSkeletonComponent,
    EmptyProductListsComponent,
  ],
  providers: [ProductListsService],
  template: `
    <h1 class="${hlmH1} mb-4 text-center">
      Products from "{{ categoryName() }}"
    </h1>
    @if (!isInitialLoading()) {
      @if (products().length > 0) {
        <div
          class="grid animate-fade-in grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          @for (product of products(); track product.id) {
            <app-product-card [product]="product" />
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
export class ProductListsComponent {
  private productListsService = inject(ProductListsService);
  private navigationService = inject(NavigationService);

  categoryName = input.required<string>();

  protected page = this.productListsService.page;
  protected pageSize = this.productListsService.pageSize;
  protected totalProducts = this.productListsService.totalProducts;
  protected products = this.productListsService.products;
  protected isInitialLoading = this.productListsService.isInitialLoading;

  protected setPage(page: number): void {
    this.navigationService.setPage(page);
  }

  protected setPageSize(pageSize: number): void {
    this.navigationService.setPageSize(pageSize);
  }
}
