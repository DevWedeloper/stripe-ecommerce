import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { QuantitySelectorComponent } from 'src/app/shared/ui/quantity-selector.component';

@Component({
  selector: 'app-product-pricing-details',
  standalone: true,
  imports: [CurrencyPipe, HlmButtonDirective, QuantitySelectorComponent],
  template: `
    <div class="mb-4 text-xl font-semibold">
      Price:
      {{ price() | currency: 'USD' }}
    </div>
    <div class="mb-4">
      Stock:
      {{ stock() > 0 ? stock() : 'Out of stock' }}
    </div>

    <app-quantity-selector
      [(quantity)]="quantity"
      [stock]="stock()"
      class="mb-4"
    />

    <button
      hlmBtn
      [disabled]="stock() <= 0 || quantity() <= 0"
      (click)="onClick()"
    >
      Add to Cart
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPricingDetailsComponent {
  stock = input.required<number>();
  price = input.required<number>();
  quantity = model.required<number>();
  addToCart = output<void>();

  protected onClick(): void {
    this.addToCart.emit();
  }
}
