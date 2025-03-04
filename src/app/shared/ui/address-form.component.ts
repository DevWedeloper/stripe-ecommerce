import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import {
  authInputErrorProvider,
  sharedFormDeps,
} from 'src/app/shared/utils/form';
import { CountrySelect } from 'src/db/schema';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [...sharedFormDeps, BrnSelectImports, HlmSelectImports],
  providers: [authInputErrorProvider],
  template: `
    <form
      [formGroup]="form()"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-4"
    >
      <hlm-form-field>
        <label hlmLabel for="fullName">Full Name</label>
        <input
          hlmInput
          formControlName="fullName"
          id="fullName"
          type="text"
          placeholder="Full Name"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-form-field>
        <label hlmLabel for="addressLine1">Address Line 1</label>
        <input
          hlmInput
          formControlName="addressLine1"
          id="addressLine1"
          type="text"
          placeholder="Address Line 1"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-form-field>
        <label hlmLabel for="addressLine2">Address Line 2</label>
        <input
          hlmInput
          formControlName="addressLine2"
          id="addressLine2"
          type="text"
          placeholder="Address Line 2"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-form-field>
        <label hlmLabel for="city">City</label>
        <input
          hlmInput
          formControlName="city"
          id="city"
          type="text"
          placeholder="City"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-form-field>
        <label hlmLabel for="state">State</label>
        <input
          hlmInput
          formControlName="state"
          id="state"
          type="text"
          placeholder="State"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-form-field>
        <label hlmLabel for="postalCode">Postal Code</label>
        <input
          hlmInput
          formControlName="postalCode"
          id="postalCode"
          type="text"
          placeholder="Postal Code"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-form-field class="flex flex-col">
        <label hlmLabel for="country">Country</label>
        <brn-select
          formControlName="countryId"
          id="country"
          placeholder="Select a country"
        >
          <hlm-select-trigger class="w-full">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content>
            @for (country of countries(); track country.id) {
              <hlm-option [value]="country.id">{{ country.code }}</hlm-option>
            }
          </hlm-select-content>
        </brn-select>
      </hlm-form-field>

      <button
        hlmBtnWithLoading
        [disabled]="form().invalid || isLoading() || disable()"
        class="w-full"
        [isLoading]="isLoading()"
      >
        Submit
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent {
  form = input.required<FormGroup>();
  countries = input.required<CountrySelect[]>();
  isLoading = input.required<boolean>();
  disable = input.required<boolean>();
  submitChange = output<void>();

  formDir = viewChild.required(FormGroupDirective);

  protected onSubmit(): void {
    this.submitChange.emit();
  }
}
