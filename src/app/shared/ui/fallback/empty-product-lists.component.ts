import { ChangeDetectionStrategy, Component } from '@angular/core';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';

@Component({
  selector: 'app-empty-product-lists',
  standalone: true,
  template: `
    <img src="/empty-product-lists.svg" alt="No products found" class="w-60" />
    <p class="${hlmMuted} mt-2 text-center">No products found...</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyProductListsComponent {}
