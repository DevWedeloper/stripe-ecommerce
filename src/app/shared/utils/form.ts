import { ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmFormFieldComponent } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { createProvider } from 'src/app/shared/utils/create-provider';
import { DynamicValidatorMessageDirective } from 'src/app/shared/dynamic-form-errors/dynamic-validator-message.directive';
import { ERROR_COMPONENT } from 'src/app/shared/dynamic-form-errors/input-error/error-component.token';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/hlm-button-with-loading.component';
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
