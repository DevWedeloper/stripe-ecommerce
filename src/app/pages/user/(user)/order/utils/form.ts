import { FormBuilder, Validators } from '@angular/forms';

export const initializeReviewForm = (
  fb: FormBuilder,
  data?: { rating: number; comment: string },
) =>
  fb.nonNullable.group({
    rating: [
      data?.rating || 0,
      [Validators.required, Validators.min(1), Validators.max(5)],
    ],
    comment: [
      data?.comment || '',
      [Validators.required, Validators.maxLength(256)],
    ],
  });
