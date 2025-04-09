import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControlStatus,
  ReactiveFormsModule,
} from '@angular/forms';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import {
  ConfirmationToken,
  StripeElementsOptions,
  StripeLinkAuthenticationElementChangeEvent,
  StripeLinkAuthenticationElementOptions,
  StripePaymentElementChangeEvent,
  StripePaymentElementOptions,
} from '@stripe/stripe-js';
import { StripeService } from 'ngx-stripe';
import { FinalizedAddressService } from 'src/app/shared/data-access/address/finalized-address.service';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { CountriesService } from 'src/app/shared/data-access/countries.service';
import { StripeConfirmationTokenService } from 'src/app/shared/data-access/stripe/stripe-confirmation-token.service';
import { StripePaymentIntentService } from 'src/app/shared/data-access/stripe/stripe-payment-intent.service';
import { ThemeService } from 'src/app/shared/ui/theme.service';
import { initializeAddressForm } from 'src/app/shared/utils/form';
import { GetAddressCheckoutService } from '../../../../shared/data-access/address/get-address-checkout.service';
import { AddressFormCheckoutComponent } from '../ui/address-form-checkout.component';
import { ShippingDetailsFormComponent } from '../ui/shipping-details-form.component';
import { ChangeAddressButtonComponent } from './change-address/change-address-button.component';

@Component({
  selector: 'app-shipping-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmSpinnerComponent,
    ShippingDetailsFormComponent,
    AddressFormCheckoutComponent,
    ChangeAddressButtonComponent,
  ],
  template: `
    @if (!isPaymentIntentLoading()) {
      @if (elementsOptions().clientSecret) {
        <div class="flex flex-col gap-4">
          @if (selectedAddress()) {
            <app-change-address-button class="self-end" />
          }
          <app-shipping-details-form
            [stripe]="stripe"
            [elementsOptions]="elementsOptions()"
            [linkAuthenticationOptions]="linkAuthenticationOptions()"
            [paymentElementOptions]="paymentElementOptions"
            [isLoading]="isConfirmationTokenLoading()"
            [disabled]="!validFields() || isConfirmationTokenLoading()"
            (emailChange)="emailChange($event)"
            (paymentChange)="paymentChange($event)"
            (completePurchase)="completePurchase()"
          >
            <app-address-form-checkout
              addressForm
              [form]="form()"
              [countries]="countries()"
              (statusChanges)="statusChange($event)"
            />
          </app-shipping-details-form>
        </div>
      }
    } @else {
      <div class="flex items-center justify-center">
        <hlm-spinner />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private stripeConfirmationTokenService = inject(
    StripeConfirmationTokenService,
  );
  private stripePaymentIntentService = inject(StripePaymentIntentService);
  private getAddressCheckoutService = inject(GetAddressCheckoutService);
  private countriesService = inject(CountriesService);
  private authService = inject(AuthService);
  private finalizedAddressService = inject(FinalizedAddressService);
  protected stripe = inject(StripeService);

  private shippingDetailsForm = viewChild(ShippingDetailsFormComponent);

  private elements = computed(() => this.shippingDetailsForm()?.elements());
  private paymentElement = computed(() =>
    this.shippingDetailsForm()?.paymentElement(),
  );

  private emailValid = signal(false);
  private paymentValid = signal(false);
  private shippingAddressValid = signal(false);

  protected validFields = computed(
    () =>
      this.emailValid() && this.paymentValid() && this.shippingAddressValid(),
  );

  protected selectedAddress = this.getAddressCheckoutService.selectedAddress;

  private isDarkMode = toSignal(inject(ThemeService).isDarkMode$);

  protected countries = this.countriesService.countries;

  private clientSecret = this.stripePaymentIntentService.clientSecret;
  protected isPaymentIntentLoading = this.stripePaymentIntentService.isLoading;

  protected isConfirmationTokenLoading =
    this.stripeConfirmationTokenService.isLoading;

  protected form = computed(() => {
    const selectedAddress = this.selectedAddress();

    const formGroup = initializeAddressForm(this.fb, {
      fullName: selectedAddress?.fullName || '',
      addressLine1: selectedAddress?.addressLine1 || '',
      addressLine2: selectedAddress?.addressLine2 || '',
      city: selectedAddress?.city || '',
      state: selectedAddress?.state || '',
      postalCode: selectedAddress?.postalCode || '',
      countryId: selectedAddress?.countryId || 0,
    });

    if (selectedAddress) {
      formGroup.controls.fullName.disable({ onlySelf: true });
      formGroup.controls.addressLine1.disable({ onlySelf: true });
      formGroup.controls.addressLine2.disable({ onlySelf: true });
      formGroup.controls.city.disable({ onlySelf: true });
      formGroup.controls.state.disable({ onlySelf: true });
      formGroup.controls.postalCode.disable({ onlySelf: true });
      formGroup.controls.countryId.disable({ onlySelf: true });
    }

    return formGroup;
  });

  protected elementsOptions = computed(() => {
    const elementsOptions: StripeElementsOptions = {
      locale: 'en',
      appearance: {
        theme: this.isDarkMode() ? 'night' : 'stripe',
      },
      clientSecret: this.clientSecret() ?? undefined,
    };

    return elementsOptions;
  });

  protected paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false,
    },
  };

  protected linkAuthenticationOptions = computed(() => {
    const user = this.authService.user();

    const linkAuthenticationElementOptions: StripeLinkAuthenticationElementOptions =
      {
        defaultValues: {
          email: user?.email ?? '',
        },
      };

    return linkAuthenticationElementOptions;
  });

  constructor() {
    effect(() => {
      if (this.paymentElement())
        this.stripeConfirmationTokenService.setPaymentElement(
          this.paymentElement(),
        );
    });
  }

  ngOnInit(): void {
    this.stripePaymentIntentService.createPaymentIntent();
    this.getAddressCheckoutService.fetchAddress();
  }

  protected completePurchase(): void {
    const {
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      countryId,
    } = this.form().getRawValue();

    const country = this.countries().find(
      (country) => country.id === countryId,
    )?.code;

    if (!countryId) {
      throw new Error('countryId cannot be null or undefined.');
    }

    if (!country) {
      throw new Error(`Country with ID ${countryId} not found.`);
    }

    const data: ConfirmationToken.Shipping = {
      name: fullName,
      address: {
        line1: addressLine1,
        line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
      },
    };

    this.elements()?.submit();
    this.stripeConfirmationTokenService.createConfirmationToken(data);
    this.finalizedAddressService.setAddress({
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      countryId,
    });
  }

  protected statusChange(data: FormControlStatus): void {
    data === 'VALID'
      ? this.shippingAddressValid.set(true)
      : this.shippingAddressValid.set(false);
  }

  protected emailChange(
    data: StripeLinkAuthenticationElementChangeEvent,
  ): void {
    data.complete ? this.emailValid.set(true) : this.emailValid.set(false);
  }

  protected paymentChange(data: StripePaymentElementChangeEvent): void {
    data.complete ? this.paymentValid.set(true) : this.paymentValid.set(false);
  }
}
