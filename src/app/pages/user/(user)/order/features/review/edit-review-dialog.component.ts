import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import { combineLatest, filter, map, startWith, switchMap, take } from 'rxjs';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { GetReviewService } from '../../data-access/review/get-review.service';
import { UpdateReviewService } from '../../data-access/review/update-review.service';
import { ReviewFormComponent } from '../../ui/review/review-form.component';
import { initializeReviewForm } from '../../utils/form';

@Component({
  selector: 'app-edit-review-dialog',
  imports: [ReviewFormComponent, HlmSpinnerComponent],
  providers: [GetReviewService],
  host: {
    class: 'w-[425px]',
  },
  template: `
    @if (!isGetLoading()) {
      <app-review-form
        [form]="form()"
        [isLoading]="isUpdateLoading()"
        [disable]="disable() || isFormDataUnmodified()"
        (submitChange)="updateReview()"
      />
    } @else {
      <div class="flex items-center justify-center">
        <hlm-spinner />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditReviewDialogComponent {
  private fb = inject(FormBuilder);
  private _dialogRef = inject(BrnDialogRef);
  private _dialogContext = injectBrnDialogContext<{ orderItemId: number }>();
  private updateReviewService = inject(UpdateReviewService);
  private getReviewService = inject(GetReviewService);

  private orderItemId = this._dialogContext.orderItemId;

  private review = this.getReviewService.review;

  protected isUpdateLoading = this.updateReviewService.isLoading;
  protected isGetLoading = this.getReviewService.isLoading;

  protected form = computed(() => {
    const review = this.review();

    if (!review) return initializeReviewForm(this.fb);

    return initializeReviewForm(this.fb, {
      rating: 5,
      comment: '',
    });
  });

  protected form$ = toObservable(this.form);

  protected isFormDataUnmodified = toSignal(
    combineLatest([
      this.getReviewService.getReviewSuccess$,
      this.form$.pipe(
        switchMap((data) =>
          data.valueChanges.pipe(
            startWith(data.getRawValue()),
            map(() => data.getRawValue()),
          ),
        ),
      ),
    ]).pipe(
      map(
        ([initialData, modifiedData]) =>
          initialData !== null &&
          initialData.rating === modifiedData.rating &&
          initialData.comment === modifiedData.comment,
      ),
    ),
    {
      initialValue: true,
    },
  );

  private disable$ = toggleDisableStream({
    enable: this.form().events.pipe(
      filter((event) => event instanceof ValueChangeEvent),
    ),
    disable: this.updateReviewService.updateReviewError$,
  });

  protected disable = toSignal(this.disable$, {
    initialValue: false,
  });

  constructor() {
    this.getReviewService.getReview(this.orderItemId);

    this.updateReviewService.updateReviewSuccess$
      .pipe(take(1))
      .subscribe(() => this._dialogRef.close());
  }

  protected updateReview(): void {
    const review = this.review();

    if (!review) throw new Error('Review not found');

    this.updateReviewService.updateReview({
      reviewId: review.id,
      data: this.form().getRawValue(),
    });
  }
}
