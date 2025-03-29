import { ChangeDetectionStrategy, Component } from '@angular/core';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';

@Component({
  selector: 'app-empty-review-list',
  template: `
    <img src="/empty-reviews.svg" alt="No reviws found" class="w-60" />
    <p class="${hlmMuted} mt-2 text-center">No reviews found...</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyReviewListComponent {}
