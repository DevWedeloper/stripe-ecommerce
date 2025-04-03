import { RouteMeta } from '@analogjs/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShoppingCartService } from 'src/app/shared/data-access/shopping-cart.service';
import { EmptyCartComponent } from 'src/app/shared/ui/fallback/empty-cart.component';
import { metaWith } from 'src/app/shared/utils/meta';
import { CartPageItemsMobileComponent } from './ui/cart-page-items-mobile.component';
import { CartPageItemsComponent } from './ui/cart-page-items.component';
import { CartSummaryComponent } from './ui/cart-summary.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Shopping Cart',
    'Review the items in your cart and proceed to checkout.',
  ),
  title: 'Stripe Ecommerce | Shopping Cart',
};

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CartPageItemsComponent,
    CartPageItemsMobileComponent,
    EmptyCartComponent,
    CartSummaryComponent,
  ],
  template: `
    @if (cart().length > 0) {
      <div class="flex flex-col gap-2">
        @for (item of cart(); track $index) {
          <app-cart-page-items
            class="hidden md:block"
            [item]="item"
            [isEditable]="isEditable()"
            (quantityChange)="
              updateQuantity(item.productItemId, item.sku, $event)
            "
            (removeFromCartChange)="
              removeFromCart(item.productItemId, item.sku)
            "
          />

          <app-cart-page-items-mobile
            class="block md:hidden"
            [item]="item"
            [isEditable]="isEditable()"
            (quantityChange)="
              updateQuantity(item.productItemId, item.sku, $event)
            "
            (removeFromCartChange)="
              removeFromCart(item.productItemId, item.sku)
            "
          />
        }
      </div>
    } @else {
      <div class="flex items-center justify-center">
        <app-empty-cart />
      </div>
    }

    <app-cart-summary
      [total]="total()"
      [cart]="cart()"
      (checkout)="proceedToCheckout()"
    />
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
