import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';
import { CartItem } from '../types/cart';
import { ItemVariationComponent } from './item-variation.component';

@Component({
  selector: 'app-view-cart',
  standalone: true,
  imports: [CurrencyPipe, NgOptimizedImage, ItemVariationComponent],
  template: `
    <div class="flex flex-col gap-2 p-4">
      @for (product of cart(); track product.productItemId) {
        <div hlmCard class="grid grid-cols-3">
          <div class="relative flex h-16 w-16 justify-center rounded">
            <img
              [ngSrc]="product.imagePath!"
              [alt]="product.name"
              class="object-cover"
              [placeholder]="product.placeholder!"
              fill
            />
          </div>

          <div class="flex flex-col items-start justify-center">
            <h2 class="text-lg font-semibold">{{ product.name }}</h2>
            <app-item-variation [variations]="product.variations" />
            <span>Qty {{ product.quantity }}</span>
          </div>

          <div class="flex flex-col items-end justify-center">
            <span class="font-semibold">
              {{
                product.price * product.quantity | currency: 'USD'
              }}
            </span>
            @if (product.quantity > 1) {
              <span class="${hlmMuted} text-sm">
                {{ product.price | currency: 'USD' }} each
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
  cart = input.required<CartItem[]>();
  total = input.required<number>();
}
