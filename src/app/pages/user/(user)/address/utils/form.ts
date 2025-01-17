import { FormBuilder, Validators } from '@angular/forms';
import { Address } from '../types/address';

export const initializeAddressForm = (fb: FormBuilder, data?: Address) =>
  fb.nonNullable.group({
    fullName: [
      data?.fullName || '',
      [Validators.required, Validators.maxLength(256)],
    ],
    addressLine1: [
      data?.addressLine1 || '',
      [Validators.required, Validators.maxLength(256)],
    ],
    addressLine2: [data?.addressLine2 || '', [Validators.maxLength(256)]],
    city: [data?.city || '', [Validators.required, Validators.maxLength(256)]],
    state: [
      data?.state || '',
      [Validators.required, Validators.maxLength(256)],
    ],
    postalCode: [
      data?.postalCode || '',
      [Validators.required, Validators.maxLength(256)],
    ],
    countryId: [data?.countryId || null, [Validators.required]],
  });
