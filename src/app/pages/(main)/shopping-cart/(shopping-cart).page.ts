import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EmptyCartComponent } from 'src/app/shared/ui/fallback/empty-cart.component';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { CartPageItemsMobileComponent } from './cart-page-items-mobile.component';
import { CartPageItemsComponent } from './cart-page-items.component';
import { CartSummaryComponent } from './cart-summary.component';

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
