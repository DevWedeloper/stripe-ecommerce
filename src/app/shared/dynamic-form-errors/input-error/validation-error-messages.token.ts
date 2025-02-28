import { InjectionToken } from '@angular/core';

export const ERROR_MESSAGES: { [key: string]: (args?: any) => string } = {
  required: () => `This field is required`,
  requiredTrue: () => `This field is required`,
  email: () => `It should be a valid email`,
  minlength: ({ requiredLength }) =>
    `The length should be at least ${requiredLength} characters`,
  maxlength: ({ requiredLength }) =>
    `The length should be at most ${requiredLength} characters`,
  pattern: () => `Wrong format`,
  passwordShouldMatch: () => `Password should match`,
  hasUpperCase: () => `Should contain at least one uppercase letter`,
  hasLowerCase: () => `Should contain at least one lowercase letter`,
  hasDigit: () => `Should contain at least one digit`,
  hasSpecialChar: () => `Should contain at least one special character`,
  zodEmail: () => `It should be a valid email`,
  isInteger: () => `Should be an integer`,
  isPositiveInteger: () => `Should be a positive integer`,
};

export const VALIDATION_ERROR_MESSAGES = new InjectionToken(
  `Validation Messages`,
  {
    providedIn: 'root',
    factory: () => ERROR_MESSAGES,
  },
);
