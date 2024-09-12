import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [HlmSkeletonComponent],
  host: {
    class: 'block w-full p-2',
  },
  template: `
    <hlm-skeleton class="mb-4 h-48 rounded-lg" />
    <div class="flex flex-col gap-4">
      <hlm-skeleton class="h-8 w-3/4" />
      <hlm-skeleton class="h-6" />
      <div class="flex justify-between">
        <hlm-skeleton class="h-4 w-1/4" />
        <hlm-skeleton class="h-4 w-1/4" />
      </div>
      <hlm-skeleton class="h-4 w-1/6" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardSkeletonComponent {}
