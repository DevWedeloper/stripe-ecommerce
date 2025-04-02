import { AbstractControl, ValidationErrors } from '@angular/forms';

export const nonEmptyArray = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.getRawValue();
  if (!Array.isArray(value)) {
    return { notAnArray: true };
  }

  return value.length > 0 ? null : { requiredArray: true };
};
