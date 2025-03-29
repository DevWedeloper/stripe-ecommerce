import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GetRatingDetailsService } from 'src/app/pages/(main)/product/data-access/review/get-rating-details.service';
import { RatingDetailsComponent } from '../ui/review/rating-details.component';

@Component({
  selector: 'app-rating-summary',
  imports: [RatingDetailsComponent],
  providers: [GetRatingDetailsService],
  template: `
    <app-rating-details [ratingsCount]="ratingDetails()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingSummaryComponent {
  private getRatingDetailsService = inject(GetRatingDetailsService);

  protected ratingDetails = this.getRatingDetailsService.ratingDetails;
}
