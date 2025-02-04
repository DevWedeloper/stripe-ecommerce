import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmFormFieldComponent } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { DynamicValidatorMessageDirective } from 'src/app/shared/dynamic-form-errors/dynamic-validator-message.directive';
import { ERROR_COMPONENT } from 'src/app/shared/dynamic-form-errors/input-error/error-component.token';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/ui/hlm-button-with-loading.component';
import { createProvider } from 'src/app/shared/utils/create-provider';
import { Address } from '../types/address';
import { AuthInputErrorComponent } from '../ui/auth-input-error.component';
import {
  hasDigit,
  hasLowerCase,
  hasSpecialChar,
  hasUpperCase,
  zodEmail,
} from '../validators';

export const sharedFormDeps = [
  ReactiveFormsModule,
  HlmLabelDirective,
  HlmInputDirective,
  HlmFormFieldComponent,
  HlmButtonWithLoadingComponent,
  DynamicValidatorMessageDirective,
];

export const authInputErrorProvider = createProvider(ERROR_COMPONENT, {
  useValue: AuthInputErrorComponent,
});

export const emailField = { email: ['', [Validators.required, zodEmail]] };
export const passwordField = { password: ['', [Validators.required]] };
export const passwordWithValidationField = {
  password: [
    '',
    [
      Validators.required,
      Validators.minLength(8),
      hasUpperCase,
      hasLowerCase,
      hasDigit,
      hasSpecialChar,
    ],
  ],
};
export const confirmPasswordField = {
  confirmPassword: ['', [Validators.required]],
};

export const initializeAddressForm = (fb: FormBuilder, data?: Address) =>
  fb.nonNullable.group({
    fullName: [
      data?.fullName || '',
      [Validators.required, Validators.maxLength(256)],
    ],
    addressLine1: [
      data?.addressLine1 || '',
      [Validators.required, Validators.maxLength(256)],
    ],
    addressLine2: [data?.addressLine2 || '', [Validators.maxLength(256)]],
    city: [data?.city || '', [Validators.required, Validators.maxLength(256)]],
    state: [
      data?.state || '',
      [Validators.required, Validators.maxLength(256)],
    ],
    postalCode: [
      data?.postalCode || '',
      [Validators.required, Validators.maxLength(256)],
    ],
    countryId: [data?.countryId || null, [Validators.required]],
  });
