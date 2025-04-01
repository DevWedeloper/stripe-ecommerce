import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmNumberedPaginationComponent } from '@spartan-ng/ui-pagination-helm';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import { GetReviewsService } from 'src/app/pages/(main)/product/data-access/review/get-reviews.service';
import { NavigationService } from 'src/app/shared/data-access/navigation.service';
import { EmptyReviewListComponent } from '../ui/review/empty-review-list.component';
import { ReviewCardComponent } from '../ui/review/review-card.component';

@Component({
  selector: 'app-review-list',
  imports: [
    FormsModule,
    ReviewCardComponent,
    EmptyReviewListComponent,
    HlmNumberedPaginationComponent,
    BrnSelectImports,
    HlmSelectImports,
    HlmSpinnerComponent,
  ],
  providers: [GetReviewsService],
  template: `
    @if (!isInitialLoading()) {
      @if (reviews().length > 0) {
        <div class="flex justify-end">
          <div class="flex gap-2">
            <brn-select [(ngModel)]="sortBy" placeholder="Sort by">
              <hlm-select-trigger>
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content>
                <hlm-option value="recent">Recent</hlm-option>
                <hlm-option value="highest">Highest</hlm-option>
                <hlm-option value="lowest">Lowest</hlm-option>
              </hlm-select-content>
            </brn-select>

            <brn-select [(ngModel)]="rating" placeholder="Select rating">
              <hlm-select-trigger>
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content>
                <hlm-option [value]="5">5 stars</hlm-option>
                <hlm-option [value]="4">4 stars</hlm-option>
                <hlm-option [value]="3">3 stars</hlm-option>
                <hlm-option [value]="2">2 stars</hlm-option>
                <hlm-option [value]="1">1 star</hlm-option>
                <hlm-option>None</hlm-option>
              </hlm-select-content>
            </brn-select>
          </div>
        </div>
        <div class="mt-4 flex flex-col gap-2">
          @for (review of reviews(); track review.id) {
            <app-review-card [review]="review" />
          }
        </div>
        <hlm-numbered-pagination
          [currentPage]="page()"
          [itemsPerPage]="pageSize()"
          [totalItems]="totalReviews()"
          (currentPageChange)="setPage($event)"
          (itemsPerPageChange)="setPageSize($event)"
        />
      } @else {
        <div class="flex items-center justify-center">
          <app-empty-review-list />
        </div>
      }
    } @else {
      <div class="flex items-center justify-center">
        <hlm-spinner />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewListComponent {
  private getReviewsService = inject(GetReviewsService);
  private navigationService = inject(NavigationService);

  protected page = this.getReviewsService.page;
  protected pageSize = this.getReviewsService.pageSize;
  protected totalReviews = this.getReviewsService.totalReviews;
  protected reviews = this.getReviewsService.reviews;

  protected isInitialLoading = this.getReviewsService.isInitialLoading;

  protected sortBy = linkedSignal({
    source: this.getReviewsService.filterStateSync,
    computation: ({ sortBy }) => sortBy,
  });
  protected rating = linkedSignal({
    source: this.getReviewsService.filterStateSync,
    computation: ({ ratingFilter }) => ratingFilter,
  });

  private setSortByEffect = effect(() => this.setSortBy(this.sortBy()));
  private setRatingFilterEffect = effect(() =>
    this.setRatingFilter(this.rating()),
  );

  protected setPage(page: number): void {
    this.navigationService.setPage(page);
  }

  protected setPageSize(pageSize: number): void {
    this.navigationService.setPageSize(pageSize);
  }

  protected setSortBy(sortBy: string | null): void {
    this.navigationService.setCustomParam('sortBy', sortBy);
  }

  protected setRatingFilter(rating: number | null): void {
    this.navigationService.setCustomParam('ratingFilter', rating);
  }
}
