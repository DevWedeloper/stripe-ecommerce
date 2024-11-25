import { RouteMeta } from '@analogjs/router';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ShoppingCartService } from 'src/app/shared/data-access/shopping-cart.service';
import { GoBackButtonComponent } from 'src/app/shared/ui/go-back-button.component';
import { CartDetailsComponent } from './cart-details.component';
import { ShippingDetailsComponent } from './features/shipping-details.component';
import { TestCardsComponent } from './ui/test-cards/test-cards.component';

export const routeMeta: RouteMeta = {
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
export default class CheckoutPageComponent implements OnInit {
  private shoppingCartService = inject(ShoppingCartService);

  ngOnInit(): void {
    this.shoppingCartService.setEditable(false);
  }
}
