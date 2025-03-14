import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { combineLatest, filter, map } from 'rxjs';
import { SelectedAddressService } from 'src/app/shared/data-access/address/selected-address.service';
import { CountriesService } from 'src/app/shared/data-access/countries.service';
import { initializeAddressForm } from 'src/app/shared/utils/form';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { UpdateAddressSchema } from 'src/schemas/address';
import { UpdateAddressService } from '../../../../../shared/data-access/address/update-address.service';
import { AddressFormComponent } from '../../../../../shared/ui/address-form.component';
@Component({
  selector: 'app-update-address',
  imports: [AddressFormComponent],
  template: `
    <app-address-form
      [form]="form()"
      [countries]="countries()"
      [isLoading]="isLoading()"
      [disable]="disable() || sameAsSelectedAddress()"
      (submitChange)="onSubmit()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAddressComponent {
  private fb = inject(FormBuilder);

  private selectedAddressService = inject(SelectedAddressService);
  private updateAddressService = inject(UpdateAddressService);
  private countriesService = inject(CountriesService);

  protected isLoading = this.updateAddressService.isLoading;
  private error$ = this.updateAddressService.updateAddressError$;

  private selectedAddress = this.selectedAddressService.selectedAddress;

  protected countries = this.countriesService.countries;

  protected form = computed(() => {
    const selectedAddress = this.selectedAddress();

    return initializeAddressForm(this.fb, {
      fullName: selectedAddress?.fullName || '',
      addressLine1: selectedAddress?.addressLine1 || '',
      addressLine2: selectedAddress?.addressLine2 || '',
      city: selectedAddress?.city || '',
      state: selectedAddress?.state || '',
      postalCode: selectedAddress?.postalCode || '',
      countryId: selectedAddress?.countryId || 0,
    });
  });

  private disable$ = toggleDisableStream({
    enable: this.form().events.pipe(
      filter((event) => event instanceof ValueChangeEvent),
    ),
    disable: this.error$,
  });

  protected disable = toSignal(this.disable$, {
    initialValue: false,
  });

  private sameAsSelectedAddress$ = combineLatest([
    this.selectedAddressService.selectedAddress$,
    this.form().valueChanges,
  ]).pipe(
    map(
      ([selectedAddress, formValue]) =>
        selectedAddress.fullName === formValue.fullName &&
        selectedAddress.addressLine1 === formValue.addressLine1 &&
        selectedAddress.addressLine2 === formValue.addressLine2 &&
        selectedAddress.city === formValue.city &&
        selectedAddress.state === formValue.state &&
        selectedAddress.postalCode === formValue.postalCode &&
        selectedAddress.countryId === formValue.countryId,
    ),
  );

  protected sameAsSelectedAddress = toSignal(this.sameAsSelectedAddress$, {
    initialValue: true,
  });

  protected onSubmit(): void {
    const selectedAddress = this.selectedAddress();

    if (!selectedAddress) return;

    const { addressId, receiverId } = selectedAddress;

    const {
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      countryId,
      fullName,
    } = this.form().getRawValue();

    if (!countryId) throw new Error('countryId cannot be null.');

    const data: UpdateAddressSchema = {
      address: {
        id: addressId,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        countryId,
      },
      receiver: {
        id: receiverId,
        fullName,
      },
    };

    this.updateAddressService.updateAddress(data);
  }
}
