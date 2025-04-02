import { AbstractControl, ValidationErrors } from '@angular/forms';
import { doItemVariationsMatchVariants } from 'src/utils/product';

export const itemVariationsMatchVariants = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.getRawValue();
  return doItemVariationsMatchVariants(value)
    ? null
    : { hasMissingVariants: true };
};
