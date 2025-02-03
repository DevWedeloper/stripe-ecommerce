import { ChangeDetectionStrategy, Component } from '@angular/core';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';

@Component({
  selector: 'app-empty-order-lists',
  standalone: true,
  host: {
    class: 'flex flex-col items-center justify-center',
  },
  template: `
    <img
      src="/empty-product-lists.svg"
      alt="Product not found"
      class="w-[80vw] max-w-80"
    />
    <p class="${hlmMuted} mt-2 text-center">Product not found...</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyOrderListsComponent {}
