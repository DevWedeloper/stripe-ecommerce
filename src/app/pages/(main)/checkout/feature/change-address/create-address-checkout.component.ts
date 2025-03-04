import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { filter } from 'rxjs';
import { CreateAddressService } from 'src/app/shared/data-access/address/create-address.service';
import { CountriesService } from 'src/app/shared/data-access/countries.service';
import { AddressFormComponent } from 'src/app/shared/ui/address-form.component';
import { initializeAddressForm } from 'src/app/shared/utils/form';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';

@Component({
  selector: 'app-create-address-checkout',
  imports: [AddressFormComponent, HlmButtonDirective],
  template: `
    <app-address-form
      class="mb-4 block"
      [form]="form"
      [countries]="countries()"
      [isLoading]="isLoading()"
      [disable]="disable()"
      (submitChange)="onSubmit()"
    />
    <button hlmBtn class="w-full" (click)="cancelChange.emit()">Cancel</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAddressCheckoutComponent {
  private fb = inject(FormBuilder);

  private createAddressService = inject(CreateAddressService);
  private countriesService = inject(CountriesService);

  cancelChange = output<void>();

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
