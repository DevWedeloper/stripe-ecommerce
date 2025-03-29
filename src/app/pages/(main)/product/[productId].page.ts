import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GoBackButtonComponent } from 'src/app/shared/ui/go-back-button.component';
import { ProductDetailsComponent } from './feature/product-details.component';
import { RatingSummaryComponent } from './feature/rating-summary.component';
import { ReviewListComponent } from './feature/review-list.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    GoBackButtonComponent,
    ProductDetailsComponent,
    RatingSummaryComponent,
    ReviewListComponent,
  ],
  template: `
    <app-go-back-button text="Go back" navigateBack />
    <app-product-details />
    <app-rating-summary class="mt-4 block" />
    <app-review-list class="mt-4 block" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductDetailPageComponent {}
