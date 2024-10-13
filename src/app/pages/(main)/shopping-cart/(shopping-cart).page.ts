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
      @for (product of cart(); track product.id) {
        <app-cart-page-items
          class="hidden md:block"
          [product]="product"
          [isEditable]="isEditable()"
          (quantityChange)="updateQuantity(product.id, $event)"
          (removeFromCartChange)="removeFromCart(product.id)"
        />

        <app-cart-page-items-mobile
          class="block md:hidden"
          [product]="product"
          [isEditable]="isEditable()"
          (quantityChange)="updateQuantity(product.id, $event)"
          (removeFromCartChange)="removeFromCart(product.id)"
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

  protected removeFromCart(productId: number) {
    this.shoppingCartService.removeFromCart(productId);
  }

  protected updateQuantity(productId: number, quantity: number) {
    this.shoppingCartService.updateQuantity(productId, quantity);
  }

  protected proceedToCheckout(): void {
    this.router.navigate(['checkout'], { replaceUrl: true });
  }
}
