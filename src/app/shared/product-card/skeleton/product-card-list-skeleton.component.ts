import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ProductCardSkeletonComponent } from './product-card-skeleton.component';

@Component({
  selector: 'app-product-card-list-skeleton',
  standalone: true,
  imports: [ProductCardSkeletonComponent],
  host: {
    class:
      'grid grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },
  template: `
    @for (card of skeletonCards(); track $index) {
      <app-product-card-skeleton />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardListSkeletonComponent {
  protected skeletonCards = signal(Array(8));
}
