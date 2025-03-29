import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-rating-details',
  template: `
    <div
      class="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row"
    >
      <div
        class="flex flex-col items-center justify-between rounded-lg bg-border p-4"
      >
        <div class="text-4xl font-semibold">
          {{ averageRating().toFixed(1) }}
        </div>
        <div class="flex">
          @for (star of [1, 2, 3, 4, 5]; track $index) {
            <div class="relative h-6 w-6">
              <div
                class="absolute left-0 top-0 flex h-full w-full justify-center"
              >
                ★
              </div>
              <div
                class="absolute left-0 top-0 flex h-full w-full justify-center text-yellow-500"
              >
                <div>
                  <span
                    class="block overflow-hidden"
                    [style.width.%]="getStarPercentage(star)"
                  >
                    ★
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
        <div>{{ totalCount() }}</div>
      </div>

      <div class="w-full">
        @for (rating of ratingsCount(); track $index) {
          <div class="flex items-center gap-2">
            <div class="w-4">{{ rating.rating }}</div>
            <div class="text-yellow-500">★</div>
            <div class="relative h-3 w-40 flex-1 rounded">
              <div
                class="absolute left-0 top-0 h-3 rounded bg-yellow-500"
                [style.width.%]="getRatingBarWidth(rating.count)"
              ></div>
            </div>
            <div class="w-8 text-right">{{ rating.count }}</div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingDetailsComponent {
  ratingsCount = input.required<{ rating: number; count: number }[]>();

  protected averageRating = computed(() => {
    const ratingsCount = this.ratingsCount();

    const weightedSum = ratingsCount.reduce(
      (sum, r) => sum + r.rating * r.count,
      0,
    );
    const totalCount = ratingsCount.reduce((sum, r) => sum + r.count, 0);

    const averageRating = totalCount > 0 ? weightedSum / totalCount : 0;

    return averageRating;
  });

  protected totalCount = computed(() =>
    this.ratingsCount().reduce((sum, r) => sum + r.count, 0),
  );

  protected getStarPercentage(star: number): number {
    return Math.max(0, Math.min(1, this.averageRating() - star + 1)) * 100;
  }

  protected getRatingBarWidth(count: number): number {
    const total = this.totalCount();
    return total ? (count / total) * 100 : 0;
  }
}
