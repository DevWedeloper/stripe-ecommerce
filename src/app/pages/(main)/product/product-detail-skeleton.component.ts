import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';

@Component({
  selector: 'app-product-detail-skeleton',
  standalone: true,
  imports: [HlmSkeletonComponent],
  host: {
    class: 'grid grid-cols-1 gap-8 p-4 md:grid-cols-2',
  },
  template: `
    <hlm-skeleton class="h-[600px] w-full rounded-lg" />
    <div class="flex flex-col justify-center gap-4">
      <hlm-skeleton class="h-8 w-1/2" />
      <hlm-skeleton class="h-4 w-3/4" />
      <hlm-skeleton class="h-8 w-1/4" />
      <hlm-skeleton class="h-4 w-1/6" />
      <hlm-skeleton class="h-4 w-1/6" />
      <hlm-skeleton class="h-8" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailSkeletonComponent {}
