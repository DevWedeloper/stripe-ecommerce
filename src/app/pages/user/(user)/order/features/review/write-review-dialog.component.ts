import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { filter, take } from 'rxjs';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { CreateReviewService } from '../../data-access/review/create-review.service';
import { ReviewFormComponent } from '../../ui/review/review-form.component';
import { initializeReviewForm } from '../../utils/form';

@Component({
  selector: 'app-write-review-dialog',
  imports: [ReviewFormComponent],
  host: {
    class: 'w-[425px]',
  },
  template: `
    <app-review-form
      [form]="form"
      [isLoading]="isLoading()"
      [disable]="disable()"
      (submitChange)="createReview()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WriteReviewDialogComponent {
  private fb = inject(FormBuilder);
  private _dialogRef = inject(BrnDialogRef);
  private _dialogContext = injectBrnDialogContext<{ orderItemId: number }>();
  private createReviewService = inject(CreateReviewService);

  private orderItemId = this._dialogContext.orderItemId;

  protected isLoading = this.createReviewService.isLoading;

  protected form = initializeReviewForm(this.fb);

  private disable$ = toggleDisableStream({
    enable: this.form.events.pipe(
      filter((event) => event instanceof ValueChangeEvent),
    ),
    disable: this.createReviewService.error$,
  });

  protected disable = toSignal(this.disable$, {
    initialValue: false,
  });

  constructor() {
    this.createReviewService.createReviewSuccessWithData$
      .pipe(take(1))
      .subscribe(() => this._dialogRef.close());
  }

  protected createReview(): void {
    this.createReviewService.createReview({
      ...this.form.getRawValue(),
      orderItemId: this.orderItemId,
    });
  }
}
