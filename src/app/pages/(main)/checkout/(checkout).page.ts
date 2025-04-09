import { RouteMeta } from '@analogjs/router';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ShoppingCartService } from 'src/app/shared/data-access/shopping-cart.service';
import { GoBackButtonComponent } from 'src/app/shared/ui/go-back-button.component';
import { metaWith } from 'src/app/shared/utils/meta';
import { CartDetailsComponent } from './feature/cart-details.component';
import { ShippingDetailsComponent } from './feature/shipping-details.component';
import { TestCardsComponent } from './ui/test-cards/test-cards.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Checkout',
    'Provide your shipping details and payment information to complete your order.',
  ),
  title: 'Stripe Ecommerce | Checkout',
  canActivate: [() => inject(ShoppingCartService).getCart().length > 0],
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    GoBackButtonComponent,
    CartDetailsComponent,
    ShippingDetailsComponent,
    TestCardsComponent,
  ],
  template: `
    <app-go-back-button path="/shopping-cart" text="Go back to Shopping Cart" />
    <div class="grid grid-cols-1 border-t border-border md:grid-cols-2">
      <app-cart-details class="p-4" />
      <app-shipping-details class="p-4" />
    </div>
    <app-test-cards class="fixed bottom-0 right-4 z-10" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckoutPageComponent implements OnInit, OnDestroy {
  private shoppingCartService = inject(ShoppingCartService);

  ngOnInit(): void {
    this.shoppingCartService.setEditable(false);
  }

  ngOnDestroy(): void {
    this.shoppingCartService.setEditable(true);
  }
}
