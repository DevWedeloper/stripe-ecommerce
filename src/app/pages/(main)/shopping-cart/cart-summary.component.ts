import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { CartItem } from 'src/app/shared/types/cart';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CurrencyPipe, HlmButtonDirective],
  host: {
    class: 'flex border-t border-border p-4 md:justify-end',
  },
  template: `
    <div class="flex w-full flex-col gap-2 md:w-fit md:items-center">
      <div class="flex justify-between gap-2">
        <span>Total:</span>
        <span>{{ total() | currency: 'USD' }}</span>
      </div>
      <button
        hlmBtn
        class="w-full md:w-fit"
        (click)="onClick()"
        [disabled]="!cart().length"
      >
        Checkout
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummaryComponent {
  total = input.required<number>();
  cart = input.required<CartItem[]>();
  checkout = output<void>();

  protected onClick(): void {
    this.checkout.emit();
  }
}
