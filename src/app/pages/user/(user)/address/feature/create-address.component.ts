import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { filter } from 'rxjs';
import { CountriesService } from 'src/app/shared/data-access/countries.service';
import { initializeAddressForm } from 'src/app/shared/utils/form';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { CreateAddressService } from '../../../../../shared/data-access/address/create-address.service';
import { AddressFormComponent } from '../../../../../shared/ui/address-form.component';

@Component({
  selector: 'app-create-address',
  standalone: true,
  imports: [AddressFormComponent],
  template: `
    <app-address-form
      [form]="form"
      [countries]="countries()"
      [isLoading]="isLoading()"
      [disable]="disable()"
      (submitChange)="onSubmit()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAddressComponent {
  private fb = inject(FormBuilder);

  private createAddressService = inject(CreateAddressService);
  private countriesService = inject(CountriesService);

  private success$ = this.createAddressService.createAddressSuccess$;
  protected isLoading = this.createAddressService.isLoading;
  private error$ = this.createAddressService.createAddressError$;

  protected countries = this.countriesService.countries;

  private addressForm = viewChild.required(AddressFormComponent);

  protected form = initializeAddressForm(this.fb);

  private disable$ = toggleDisableStream({
    enable: this.form.events.pipe(
      filter((event) => event instanceof ValueChangeEvent),
    ),
    disable: this.error$,
  });

  protected disable = toSignal(this.disable$, {
    initialValue: false,
  });

  constructor() {
    this.success$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.addressForm().formDir().resetForm());
  }

  protected onSubmit(): void {
    if (!this.form.controls.countryId.value) return;

    this.createAddressService.createAddress({
      ...this.form.getRawValue(),
      countryId: this.form.controls.countryId.value,
    });
  }
}
