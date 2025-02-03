import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormControlStatus, FormGroup } from '@angular/forms';
import {
  StripeElementsOptions,
  StripeLinkAuthenticationElementChangeEvent,
  StripeLinkAuthenticationElementOptions,
  StripePaymentElementChangeEvent,
  StripePaymentElementOptions,
} from '@stripe/stripe-js';
import {
  StripeElementsDirective,
  StripeLinkAuthenticationComponent,
  StripePaymentElementComponent,
  StripeServiceInterface,
} from 'ngx-stripe';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/ui/hlm-button-with-loading.component';
import { CountrySelect } from 'src/db/schema';
import { AddressFormCheckoutComponent } from './address-form-checkout.component';

@Component({
  selector: 'app-shipping-details-form',
  standalone: true,
  imports: [
    AddressFormCheckoutComponent,
    StripeElementsDirective,
    StripePaymentElementComponent,
    StripeLinkAuthenticationComponent,
    HlmButtonWithLoadingComponent,
  ],
  template: `
    <ngx-stripe-elements
      [stripe]="stripe()"
      [elementsOptions]="elementsOptions()"
    >
      <app-address-form-checkout
        [form]="form()"
        [countries]="countries()"
        (statusChanges)="statusChange.emit($event)"
      />
      <ngx-stripe-link-authentication
        [options]="linkAuthenticationOptions()"
        (change)="emailChange.emit($event)"
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
  form = input.required<FormGroup>();
  countries = input.required<CountrySelect[]>();
  stripe = input.required<StripeServiceInterface>();
  elementsOptions = input.required<StripeElementsOptions>();
  linkAuthenticationOptions =
    input.required<StripeLinkAuthenticationElementOptions>();
  paymentElementOptions = input.required<StripePaymentElementOptions>();
  isLoading = input.required<boolean>();
  disabled = input.required<boolean>();
  statusChange = output<FormControlStatus>();
  emailChange = output<StripeLinkAuthenticationElementChangeEvent>();
  paymentChange = output<StripePaymentElementChangeEvent>();
  completePurchase = output<void>();

  elements = viewChild.required(StripeElementsDirective);
  paymentElement = viewChild.required(StripePaymentElementComponent);
}
