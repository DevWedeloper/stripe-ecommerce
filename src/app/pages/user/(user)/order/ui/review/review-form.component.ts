import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  authInputErrorProvider,
  sharedFormDeps,
} from 'src/app/shared/utils/form';
import { StarRatingComponent } from './star-rating.component';

@Component({
  selector: 'app-review-form',
  imports: [...sharedFormDeps, StarRatingComponent],
  providers: [authInputErrorProvider],
  template: `
    <form
      [formGroup]="form()"
      (ngSubmit)="submitChange.emit()"
      class="text-center"
    >
      <div class="mb-4">
        <label class="mb-2 block font-semibold" for="rating">
          What is your rate?
        </label>
        <app-star-rating
          formControlName="rating"
          id="rating"
          class="flex justify-center"
        ></app-star-rating>
      </div>

      <div class="mb-4">
        <label class="mb-2 block font-semibold" for="comment">
          Please share your opinion about the product
        </label>
        <textarea
          formControlName="comment"
          id="comment"
          class="min-h-24 w-full resize-none"
          hlmInput
          placeholder="Your review"
        ></textarea>
      </div>

      <button
        hlmBtnWithLoading
        [isLoading]="isLoading()"
        [disabled]="form().invalid || isLoading() || disable()"
        class="w-full"
      >
        Send Review
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewFormComponent {
  form = input.required<FormGroup>();
  disable = input.required<boolean>();
  isLoading = input.required<boolean>();
  submitChange = output<void>();
}
