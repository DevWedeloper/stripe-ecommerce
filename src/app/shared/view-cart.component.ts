import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';
import { ProductWithQuantity } from 'src/app/shared/shopping-cart.service';
import { getS3ImageUrl } from 'src/app/shared/utils';

@Component({
  selector: 'app-view-cart',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="flex flex-col gap-2 p-4">
      @for (product of cart(); track product.id) {
        <div hlmCard class="grid grid-cols-3">
          <div class="flex justify-center">
            <img
              [src]="getS3ImageUrl(product.imagePath)"
              [alt]="product.name"
              class="h-16 w-16 rounded object-cover"
            />
          </div>

          <div class="flex flex-col items-start justify-center">
            <h2 class="text-lg font-semibold">{{ product.name }}</h2>
            <span>Qty {{ product.quantity }}</span>
          </div>

          <div class="flex flex-col items-end justify-center">
            <span class="font-semibold">
              {{
                product.price * product.quantity | currency: product.currency
              }}
            </span>
            @if (product.quantity > 1) {
              <span class="${hlmMuted} text-sm">
                {{ product.price | currency: product.currency }} each
              </span>
            }
          </div>
        </div>
      } @empty {
        <div>Empty cart...</div>
      }
    </div>

    <div class="flex justify-end border-t border-border p-4">
      <span>Total: {{ total() | currency: 'USD' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCartComponent {
  cart = input.required<ProductWithQuantity[]>();
  total = input.required<number>();

  protected getS3ImageUrl = getS3ImageUrl;
}
