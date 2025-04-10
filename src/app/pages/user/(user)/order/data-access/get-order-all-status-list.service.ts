import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { BaseGetOrder } from './base-get-order';

@Injectable()
export class GetOrderAllStatusListService extends BaseGetOrder {
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
