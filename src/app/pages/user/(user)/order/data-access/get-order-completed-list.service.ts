import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { BaseGetOrder } from './base-get-order';

@Injectable()
export class GetOrderCompletedListService extends BaseGetOrder {
  protected override get ORDER_STATUS() {
    return 'Delivered' as const;
  }

  protected override get trigger$(): Observable<any> {
    return merge(
      this.filter$,
      this.updateOrderStatusService.updateOrderStatusSuccess$,
      this.createReviewService.createReviewSuccessWithData$,
      this.updateReviewService.updateReviewSuccess$,
      this.deleteReviewService.deleteReviewSuccess$,
    );
  }
}
