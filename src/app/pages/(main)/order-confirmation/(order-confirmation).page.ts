import { RouteMeta } from '@analogjs/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideLoaderCircle } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { hlmH1, hlmH3 } from '@spartan-ng/ui-typography-helm';
import { of } from 'rxjs';
import { GoBackButtonComponent } from 'src/app/shared/go-back-button.component';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { StripeConfirmPaymentService } from 'src/app/shared/stripe/stripe-confirm-payment.service';
import { StripeConfirmationTokenService } from 'src/app/shared/stripe/stripe-confirmation-token.service';
import { ViewCartComponent } from 'src/app/shared/view-cart.component';
import { ConfirmNavigationComponent } from './confirm-navigation.component';
import { ViewShippingDetailsComponent } from './view-shipping-details.component';

export const routeMeta: RouteMeta = {
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
        const dialogRef = _hlmDialogService.open(ConfirmNavigationComponent, {
          contentClass: 'flex',
          closeOnBackdropClick: false,
        });

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
    HlmButtonDirective,
    HlmIconComponent,
    GoBackButtonComponent,
    ViewCartComponent,
    ViewShippingDetailsComponent,
  ],
  providers: [provideIcons({ lucideLoaderCircle })],
  template: `
    <app-go-back-button path="/checkout" text="Go back to Checkout" />

    <div class="border-t border-border p-4">
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
        hlmBtn
        class="mx-auto mt-2 block w-fit"
        (click)="pay()"
        [disabled]="isLoading()"
      >
        @if (isLoading()) {
          <hlm-icon
            size="sm"
            class="mr-2 animate-spin"
            name="lucideLoaderCircle"
          />
        }
        Confirm
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrderConfirmationPageComponent {
  private shoppingCartService = inject(ShoppingCartService);
  private stripeConfirmPaymentService = inject(StripeConfirmPaymentService);

  protected isLoading = this.stripeConfirmPaymentService.isLoading;

  protected cart = this.shoppingCartService.getCart;
  protected total = this.shoppingCartService.total;

  protected pay(): void {
    this.stripeConfirmPaymentService.confirmPaymentTrigger$.next();
  }
}
