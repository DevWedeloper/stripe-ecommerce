import { ChangeDetectionStrategy, Component } from '@angular/core';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';

@Component({
  selector: 'app-empty-cart',
  standalone: true,
  template: `
    <img src="/empty-cart.svg" alt="Empty Cart" class="w-48" />
    <p class="${hlmMuted} mt-2 text-center">Your cart is currently empty...</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyCartComponent {}
