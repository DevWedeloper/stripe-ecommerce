import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';
import { StripeConfirmationTokenService } from 'src/app/shared/data-access/stripe/stripe-confirmation-token.service';

const formGroupStyle = 'rounded-md border border-border p-4';

@Component({
  selector: 'app-view-shipping-details',
  standalone: true,
  imports: [ReactiveFormsModule, HlmInputDirective, HlmLabelDirective],
  template: `
    <form class="${formGroupStyle}" [formGroup]="shippingDetailsForm()">
      <label hlmLabel>
        Email
        <input
          hlmInput
          class="mb-4 w-full"
          formControlName="email"
          type="email"
          placeholder="Email"
        />
      </label>

      <label hlmLabel>
        Full Name
        <input
          hlmInput
          class="mb-4 w-full"
          formControlName="fullName"
          type="text"
          placeholder="Full Name"
        />
      </label>

      <fieldset class="${formGroupStyle} mb-4" formGroupName="address">
        <legend class="${hlmMuted} font-bold">Address</legend>

        <label hlmLabel>
          Line 1
          <input
            hlmInput
            class="mb-4 w-full"
            formControlName="line1"
            type="text"
            placeholder="Line 1"
          />
        </label>

        <label hlmLabel>
          Line 2
          <input
            hlmInput
            class="mb-4 w-full"
            formControlName="line2"
            type="text"
            placeholder="Line 2"
          />
        </label>

        <label hlmLabel>
          City
          <input
            hlmInput
            class="mb-4 w-full"
            formControlName="city"
            type="text"
            placeholder="City"
          />
        </label>

        <label hlmLabel>
          State
          <input
            hlmInput
            class="mb-4 w-full"
            formControlName="state"
            type="text"
            placeholder="State"
          />
        </label>

        <label hlmLabel>
          Postal Code
          <input
            hlmInput
            class="mb-4 w-full"
            formControlName="postalCode"
            type="text"
            placeholder="Postal Code"
          />
        </label>

        <label hlmLabel>
          Country
          <input
            hlmInput
            class="mb-4 w-full"
            formControlName="country"
            type="text"
            placeholder="Country"
          />
        </label>
      </fieldset>

      <label hlmLabel>
        Phone
        <input
          hlmInput
          class="mb-4 w-full"
          formControlName="phone"
          type="tel"
          placeholder="Phone"
        />
      </label>
    </form>
  `,
})
export class ViewShippingDetailsComponent {
  private fb = inject(FormBuilder);
  private stripeConfirmationTokenService = inject(
    StripeConfirmationTokenService,
  );

  private data = this.stripeConfirmationTokenService.emailAndShippingAddress;

  protected shippingDetailsForm = computed(() => {
    const { email, shippingAddress } = this.data();

    const formGroup = this.fb.nonNullable.group({
      email: [email || ''],
      fullName: [shippingAddress?.name || ''],
      address: this.fb.nonNullable.group({
        line1: [shippingAddress?.address?.line1 || ''],
        line2: [shippingAddress?.address?.line2 || ''],
        city: [shippingAddress?.address?.city || ''],
        state: [shippingAddress?.address?.state || ''],
        postalCode: [shippingAddress?.address?.postal_code || ''],
        country: [shippingAddress?.address?.country || ''],
      }),
      phone: [shippingAddress?.phone || ''],
    });

    formGroup.disable();

    return formGroup;
  });
}
