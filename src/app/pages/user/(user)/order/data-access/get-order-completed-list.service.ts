import { inject, Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { BaseGetOrder } from './base-get-order';
import { CreateReviewService } from './review/create-review.service';
import { DeleteReviewService } from './review/delete-review.service';
import { UpdateReviewService } from './review/update-review.service';

@Injectable({
  providedIn: 'root',
})
export class GetOrderCompletedListService extends BaseGetOrder {
  private createReviewService = inject(CreateReviewService);
  private updateReviewService = inject(UpdateReviewService);
  private deleteReviewService = inject(DeleteReviewService);

  constructor() {
    super();
    this.ORDER_STATUS = 'Delivered';
    this.trigger$ = merge(
      this.filter$,
      this.updateOrderStatusService.updateOrderStatusSuccess$,
      this.createReviewService.createReviewSuccessWithData$,
      this.updateReviewService.updateReviewSuccess$,
      this.deleteReviewService.deleteReviewSuccess$,
    ) as Observable<any>;
  }
}
