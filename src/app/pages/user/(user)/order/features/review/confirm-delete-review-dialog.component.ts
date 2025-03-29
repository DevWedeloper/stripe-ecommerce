import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { take } from 'rxjs';
import { DeleteReviewService } from '../../data-access/review/delete-review.service';

@Component({
  selector: 'app-confirm-delete-review-dialog',
  imports: [
    HlmButtonDirective,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
  ],
  host: {
    class: 'w-[425px]',
  },
  template: `
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Confirm review deletion</h3>
      <p hlmDialogDescription>
        Are you sure you want to delete your review? Once deleted, you
        won&rsquo;t be able to create a new one.
      </p>
    </hlm-dialog-header>
    <hlm-dialog-footer class="mt-2">
      <button hlmBtn (click)="cancel()">Cancel</button>
      <button hlmBtn variant="destructive" (click)="confirm()">Confirm</button>
    </hlm-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeleteReviewDialogComponent {
  private _dialogRef = inject(BrnDialogRef);
  private _dialogContext = injectBrnDialogContext<{ orderItemId: number }>();
  private deleteReviewService = inject(DeleteReviewService);

  private orderItemId = this._dialogContext.orderItemId;

  constructor() {
    this.deleteReviewService.deleteReviewSuccess$
      .pipe(take(1))
      .subscribe(() => this._dialogRef.close());
  }

  protected cancel(): void {
    this._dialogRef.close();
  }

  protected confirm(): void {
    this.deleteReviewService.deleteReview(this.orderItemId);
  }
}
