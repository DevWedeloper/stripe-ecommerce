import { InjectionToken, InputSignal, Type } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

export type ErrorComponent = {
  errors: InputSignal<ValidationErrors | undefined | null>;
};

export const ERROR_COMPONENT = new InjectionToken<Type<ErrorComponent>>(
  'Error Component',
);
