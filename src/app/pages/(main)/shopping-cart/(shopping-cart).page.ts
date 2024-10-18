import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { CartPageItemsMobileComponent } from './cart-page-items-mobile.component';
import { CartPageItemsComponent } from './cart-page-items.component';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CurrencyPipe,
    HlmButtonDirective,
    CartPageItemsComponent,
    CartPageItemsMobileComponent,
  ],
  template: `
    <div class="flex flex-col gap-2">
      @for (item of cart(); track $index) {
        <app-cart-page-items
          class="hidden md:block"
          [item]="item"
          [isEditable]="isEditable()"
          (quantityChange)="updateQuantity(item.productId, item.sku, $event)"
          (removeFromCartChange)="removeFromCart(item.productId, item.sku)"
        />

        <app-cart-page-items-mobile
          class="block md:hidden"
          [item]="item"
          [isEditable]="isEditable()"
          (quantityChange)="updateQuantity(item.productId, item.sku, $event)"
          (removeFromCartChange)="removeFromCart(item.productId, item.sku)"
        />
      } @empty {
        <div>Empty cart...</div>
      }
    </div>

    <div class="flex border-t border-border p-4 md:justify-end">
      <div class="flex w-full flex-col gap-2 md:w-fit md:items-center">
        <div class="flex justify-between gap-2">
          <span>Total:</span>
          <span>{{ total() | currency: 'USD' }}</span>
        </div>
        <button
          hlmBtn
          class="w-full md:w-fit"
          (click)="proceedToCheckout()"
          [disabled]="!cart().length"
        >
          Checkout
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ShoppingCartPageComponent {
  private router = inject(Router);
  private shoppingCartService = inject(ShoppingCartService);

  protected cart = this.shoppingCartService.getCart;
  protected total = this.shoppingCartService.total;
  protected isEditable = this.shoppingCartService.isEditable;

  protected removeFromCart(productId: number, sku: string) {
    this.shoppingCartService.removeFromCart(productId, sku);
  }

  protected updateQuantity(productId: number, sku: string, quantity: number) {
    this.shoppingCartService.updateQuantity(productId, sku, quantity);
  }

  protected proceedToCheckout(): void {
    this.router.navigate(['checkout'], { replaceUrl: true });
  }
}
