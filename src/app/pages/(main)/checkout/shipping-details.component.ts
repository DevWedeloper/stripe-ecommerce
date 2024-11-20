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
import { ReactiveFormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideLoaderCircle } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
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
  StripeService,
} from 'ngx-stripe';
import { StripeConfirmationTokenService } from 'src/app/shared/stripe/stripe-confirmation-token.service';
import { StripePaymentIntentService } from 'src/app/shared/stripe/stripe-payment-intent.service';
import { ThemeService } from 'src/app/shared/theme.service';

@Component({
  selector: 'app-shipping-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmIconComponent,
    HlmSpinnerComponent,
    StripeElementsDirective,
    StripePaymentElementComponent,
    StripeLinkAuthenticationComponent,
    StripeAddressComponent,
    HlmButtonDirective,
  ],
  providers: [provideIcons({ lucideLoaderCircle })],
  template: `
    @if (!isPaymentIntentLoading()) {
      @if (elementsOptions().clientSecret) {
        <ngx-stripe-elements
          [stripe]="stripe"
          [elementsOptions]="elementsOptions()"
        >
          <ngx-stripe-link-authentication (change)="emailChange($event)" />
          <ngx-stripe-address
            [options]="shippingAddressOptions"
            (change)="shippingAddressChange($event)"
          />
          <ngx-stripe-payment
            [options]="paymentElementOptions"
            (change)="paymentChange($event)"
          />
          <button
            hlmBtn
            class="mt-2 w-full"
            (click)="completePurchase()"
            [disabled]="!validFields() || isConfirmationTokenLoading()"
          >
            @if (isConfirmationTokenLoading()) {
              <hlm-icon
                size="sm"
                class="mr-2 animate-spin"
                name="lucideLoaderCircle"
              />
            }
            PAY
          </button>
        </ngx-stripe-elements>
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
  private stripeConfirmationTokenService = inject(
    StripeConfirmationTokenService,
  );
  private stripePaymentIntentService = inject(StripePaymentIntentService);
  protected stripe = inject(StripeService);

  private elements = viewChild(StripeElementsDirective);
  private paymentElement = viewChild(StripePaymentElementComponent);

  private emailValid = signal(false);
  private paymentValid = signal(false);
  private shippingAddressValid = signal(false);

  protected validFields = computed(
    () =>
      this.emailValid() && this.paymentValid() && this.shippingAddressValid(),
  );

  private isDarkMode = toSignal(inject(ThemeService).isDarkMode$);

  private clientSecret = this.stripePaymentIntentService.clientSecret;
  protected isPaymentIntentLoading = this.stripePaymentIntentService.isLoading;

  protected isConfirmationTokenLoading =
    this.stripeConfirmationTokenService.isLoading;

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

  protected shippingAddressOptions: StripeAddressElementOptions = {
    mode: 'shipping',
    display: {
      name: 'split',
    },
    fields: {
      phone: 'always',
    },
  };

  constructor() {
    effect(() => {
      if (this.paymentElement)
        this.stripeConfirmationTokenService.paymentElement$.next(
          this.paymentElement(),
        );
    });
  }

  ngOnInit(): void {
    this.stripePaymentIntentService.createPaymentIntent$.next();
  }

  protected completePurchase(): void {
    this.elements()?.submit();
    this.stripeConfirmationTokenService.createConfirmationToken();
  }

  protected emailChange(
    data: StripeLinkAuthenticationElementChangeEvent,
  ): void {
    data.complete ? this.emailValid.set(true) : this.emailValid.set(false);
  }

  protected paymentChange(data: StripePaymentElementChangeEvent): void {
    data.complete ? this.paymentValid.set(true) : this.paymentValid.set(false);
  }

  protected shippingAddressChange(data: StripeAddressElementChangeEvent): void {
    data.complete
      ? this.shippingAddressValid.set(true)
      : this.shippingAddressValid.set(false);
  }
}
