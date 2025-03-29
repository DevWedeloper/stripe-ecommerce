import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { ReviewData } from 'src/db/data-access/review/get-paginated-reviews';

@Component({
  selector: 'app-review-card',
  imports: [DatePipe],
  host: {
    class: 'p-4',
  },
  hostDirectives: [HlmCardDirective],
  template: `
    <div class="flex items-center">
      <img
        [src]="review().avatarPath ?? '/avatar-placeholder.svg'"
        alt="Avatar"
        class="mr-2 h-12 w-12 rounded-full object-cover"
      />
      <span class="text-yellow-500">
        {{ '⭐'.repeat(review().rating) }}
      </span>
      <time class="ml-auto self-start text-sm">
        {{ review().createdAt | date: 'short' }}
      </time>
    </div>

    <div class="mt-2">
      <ul class="flex gap-2">
        @for (variation of review().variations; track $index) {
          <li class="text-sm">
            <strong>{{ variation.name }}:</strong>
            {{ variation.value }}
          </li>
        }
      </ul>
      <p>{{ review().comment }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCardComponent {
  review = input.required<ReviewData>();
}
