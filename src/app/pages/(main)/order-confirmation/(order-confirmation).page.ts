import { RouteMeta } from '@analogjs/router';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import { hlmH1, hlmH3 } from '@spartan-ng/ui-typography-helm';
import { of } from 'rxjs';
import { ShoppingCartService } from 'src/app/shared/data-access/shopping-cart.service';
import { StripeConfirmPaymentService } from 'src/app/shared/data-access/stripe/stripe-confirm-payment.service';
import { StripeConfirmationTokenService } from 'src/app/shared/data-access/stripe/stripe-confirmation-token.service';
import { GoBackButtonComponent } from 'src/app/shared/ui/go-back-button.component';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/ui/hlm-button-with-loading.component';
import { ViewCartComponent } from 'src/app/shared/ui/view-cart.component';
import { metaWith } from 'src/app/shared/utils/meta';
import { ConfirmCartService } from './data-access/confirm-cart.service';
import { ConfirmNavigationDialogComponent } from './feature/confirm-navigation-dialog.component';
import { ViewShippingDetailsComponent } from './feature/view-shipping-details.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Order Confirmation',
    'Review your order details and confirm everything is correct before completing your purchase.',
  ),
  title: 'Stripe Ecommerce | Order Confirmation',
  canActivate: [() => inject(StripeConfirmationTokenService).isSuccessful()],
  canDeactivate: [
    (_component, _currentRoute, _currentState, nextState) => {
      const allowedUrls = [
        '/checkout',
        '/order-confirmation/success',
        '/order-confirmation/error',
      ];

      if (!allowedUrls.includes(nextState.url)) {
        const _hlmDialogService = inject(HlmDialogService);
        const dialogRef = _hlmDialogService.open(
          ConfirmNavigationDialogComponent,
          {
            contentClass: 'flex',
            closeOnBackdropClick: false,
          },
        );

        return dialogRef.closed$;
      }

      return of(true);
    },
  ],
};

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    HlmSpinnerComponent,
    GoBackButtonComponent,
    ViewCartComponent,
    ViewShippingDetailsComponent,
    HlmButtonWithLoadingComponent,
  ],
  providers: [ConfirmCartService],
  template: `
    <app-go-back-button path="/checkout" text="Go back to Checkout" />

    @if (!isConfirmCartLoading()) {
      <div class="flex flex-col border-t border-border p-4">
        <h1 class="${hlmH1} mb-4 text-center">Confirm your order</h1>

        <h3 class="${hlmH3} mb-2 font-bold">Cart</h3>
        <app-view-cart
          class="mb-4 block border border-border p-4"
          [cart]="cart()"
          [total]="total()"
        />

        <h3 class="${hlmH3} mb-2 font-bold">Shipping Details</h3>
        <app-view-shipping-details />

        <button
          hlmBtnWithLoading
          class="mx-auto mt-2"
          (click)="pay()"
          [disabled]="isConfirmPaymentLoading()"
          [isLoading]="isConfirmPaymentLoading()"
        >
          Confirm
        </button>
      </div>
    } @else {
      <div class="flex items-center justify-center">
        <hlm-spinner />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrderConfirmationPageComponent
  implements OnInit, OnDestroy
{
  private shoppingCartService = inject(ShoppingCartService);
  private confirmCartService = inject(ConfirmCartService);
  private stripeConfirmPaymentService = inject(StripeConfirmPaymentService);

  protected isConfirmPaymentLoading =
    this.stripeConfirmPaymentService.isLoading;

  protected cart = this.confirmCartService.cart;
  protected total = this.confirmCartService.total;

  protected isConfirmCartLoading = this.confirmCartService.isLoading;

  ngOnInit(): void {
    this.shoppingCartService.setEditable(false);
  }

  ngOnDestroy(): void {
    this.shoppingCartService.setEditable(true);
  }

  protected pay(): void {
    this.stripeConfirmPaymentService.confirmPayment();
  }
}
