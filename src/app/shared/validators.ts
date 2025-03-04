import { AbstractControl, ValidationErrors } from '@angular/forms';
import { intSchema, positiveIntSchema } from 'src/schemas/shared/numbers';
import { z } from 'zod';

export const passwordShouldMatch = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  const errors = { passwordShouldMatch: { mismatch: true } };

  if (password?.getRawValue() === confirmPassword?.getRawValue()) {
    return null;
  }

  confirmPassword?.setErrors(errors);

  return errors;
};

export const hasUpperCase = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.getRawValue() || '';
  return /[A-Z]/.test(value) ? null : { hasUpperCase: true };
};

export const hasLowerCase = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.getRawValue() || '';
  return /[a-z]/.test(value) ? null : { hasLowerCase: true };
};

export const hasDigit = (control: AbstractControl): ValidationErrors | null => {
  const value = control.getRawValue() || '';
  return /\d/.test(value) ? null : { hasDigit: true };
};

export const hasSpecialChar = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.getRawValue() || '';
  return /[\p{P}\p{S}]/u.test(value) ? null : { hasSpecialChar: true };
};

export const zodEmail = (control: AbstractControl): ValidationErrors | null => {
  const value = control.getRawValue() || '';
  const emailSchema = z.string().email();
  const validation = emailSchema.safeParse(value);
  return validation.success ? null : { zodEmail: true };
};

export const matchPhrase =
  (expectedPhrase: string) => (control: AbstractControl) => {
    const value = control.getRawValue() || '';
    return value === expectedPhrase ? null : { matchPhrase: true };
  };

export const isInteger = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;

  if (Array.isArray(value)) {
    const invalid = value.some((val) => !intSchema.safeParse(val));
    return invalid ? { isInteger: true } : null;
  }

  return Number.isInteger(value) ? null : { isInteger: true };
};

export const isPositiveInteger = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.getRawValue();

  if (Array.isArray(value)) {
    const invalid = value.some(
      (val) => !positiveIntSchema.safeParse(val).success,
    );
    return invalid ? { isPositiveInteger: true } : null;
  }

  return positiveIntSchema.safeParse(value).success
    ? null
    : { isPositiveInteger: true };
};
