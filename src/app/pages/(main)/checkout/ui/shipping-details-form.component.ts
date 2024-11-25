import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  StripeAddressElementChangeEvent,
  StripeAddressElementOptions,
  StripeElementsOptions,
  StripeLinkAuthenticationElementChangeEvent,
  StripePaymentElementChangeEvent,
  StripePaymentElementOptions,
} from '@stripe/stripe-js';
import {
  StripeAddressComponent,
  StripeElementsDirective,
  StripeLinkAuthenticationComponent,
  StripePaymentElementComponent,
  StripeServiceInterface,
} from 'ngx-stripe';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/ui/hlm-button-with-loading.component';

@Component({
  selector: 'app-shipping-details-form',
  standalone: true,
  imports: [
    StripeElementsDirective,
    StripePaymentElementComponent,
    StripeLinkAuthenticationComponent,
    StripeAddressComponent,
    HlmButtonWithLoadingComponent,
  ],
  template: `
    <ngx-stripe-elements
      [stripe]="stripe()"
      [elementsOptions]="elementsOptions()"
    >
      <ngx-stripe-link-authentication (change)="emailChange.emit($event)" />
      <ngx-stripe-address
        [options]="shippingAddressOptions()"
        (change)="shippingAddressChange.emit($event)"
      />
      <ngx-stripe-payment
        [options]="paymentElementOptions()"
        (change)="paymentChange.emit($event)"
      />
      <button
        hlmBtnWithLoading
        class="mt-2 w-full"
        (click)="completePurchase.emit()"
        [disabled]="disabled()"
        [isLoading]="isLoading()"
      >
        PAY
      </button>
    </ngx-stripe-elements>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingDetailsFormComponent {
  stripe = input.required<StripeServiceInterface>();
  elementsOptions = input.required<StripeElementsOptions>();
  shippingAddressOptions = input.required<StripeAddressElementOptions>();
  paymentElementOptions = input.required<StripePaymentElementOptions>();
  isLoading = input.required<boolean>();
  disabled = input.required<boolean>();
  emailChange = output<StripeLinkAuthenticationElementChangeEvent>();
  shippingAddressChange = output<StripeAddressElementChangeEvent>();
  paymentChange = output<StripePaymentElementChangeEvent>();
  completePurchase = output<void>();
}
