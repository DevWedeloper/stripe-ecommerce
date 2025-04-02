import { AbstractControl, ValidationErrors } from '@angular/forms';
import { hasUniqueValues } from 'src/utils/product';

export const uniqueValues =
  (key?: string) =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = control.getRawValue();
    if (!Array.isArray(value)) {
      return { notAnArray: true };
    }

    return hasUniqueValues(value, key) ? null : { duplicateValues: true };
  };
