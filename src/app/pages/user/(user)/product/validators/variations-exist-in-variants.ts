import { AbstractControl, ValidationErrors } from '@angular/forms';
import { hasValidVariations } from 'src/utils/product';

export const variationsExistInVariants = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.getRawValue();
  return hasValidVariations(value) ? null : { invalidVariation: true };
};
