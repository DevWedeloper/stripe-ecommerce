import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';
import {
  hasUniqueCombinations,
  UniqueCombinationConfig,
} from 'src/utils/product';

export const uniqueCombination =
  (config: UniqueCombinationConfig) =>
  (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return { notAFormArray: true };
    }

    const value = control.getRawValue();
    return hasUniqueCombinations(value, config)
      ? null
      : { duplicateCombination: true };
  };
