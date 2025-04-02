import { AbstractControl, ValidationErrors } from '@angular/forms';

export const maxItems =
  (max: number) =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = control.getRawValue();
    if (!Array.isArray(value)) {
      return { notAnArray: true };
    }

    if (value.length > max) {
      return { maxItems: { maxItems: max, actual: value.length } };
    }

    return null;
  };
