import { AbstractControl, ValidationErrors } from '@angular/forms';
import { z } from 'zod';

export const passwordShouldMatch = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  const errors = { passwordShouldMatch: { mismatch: true } };

  if (password?.value === confirmPassword?.value) {
    return null;
  }

  confirmPassword?.setErrors(errors);

  return errors;
};

export const hasUpperCase = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value || '';
  return /[A-Z]/.test(value) ? null : { hasUpperCase: true };
};

export const hasLowerCase = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value || '';
  return /[a-z]/.test(value) ? null : { hasLowerCase: true };
};

export const hasDigit = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value || '';
  return /\d/.test(value) ? null : { hasDigit: true };
};

export const hasSpecialChar = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value || '';
  return /[\p{P}\p{S}]/u.test(value) ? null : { hasSpecialChar: true };
};

export const zodEmail = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value || '';
  const emailSchema = z.string().email();
  const validation = emailSchema.safeParse(value);
  return validation.success ? null : { zodEmail: true };
};

export const matchPhrase =
  (expectedPhrase: string) => (control: AbstractControl) => {
    const value = control.value || '';
    return value === expectedPhrase ? null : { matchPhrase: true };
  };

export const charLength =
  (requiredLength: number) =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';

    if (value.length === requiredLength) {
      return null;
    }

    return { charLength: { requiredLength } };
  };
