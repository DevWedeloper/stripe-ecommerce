import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrnRadioComponent } from '@spartan-ng/brain/radio-group';
import {
  HlmRadioDirective,
  HlmRadioGroupComponent,
  HlmRadioIndicatorComponent,
} from '@spartan-ng/ui-radiogroup-helm';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import { SelectedAddressService } from 'src/app/shared/data-access/address/selected-address.service';
import { CountriesService } from 'src/app/shared/data-access/countries.service';
import { AddressAndReceiverData } from 'src/db/types';
import { GetAddressCheckoutService } from '../../../../../shared/data-access/address/get-address-checkout.service';
import { AddressCardCheckoutComponent } from '../../ui/address-card-checkout.component';

@Component({
  selector: 'app-address-list-checkout',
  imports: [
    FormsModule,
    AddressCardCheckoutComponent,
    HlmSpinnerComponent,
    BrnRadioComponent,
    HlmRadioIndicatorComponent,
    HlmRadioGroupComponent,
    HlmRadioDirective,
  ],
  template: `
    @if (!isInitialLoading()) {
      <hlm-radio-group [(ngModel)]="combinedIds">
        <div class="flex flex-col gap-4">
          @for (address of addresses(); track $index) {
            <div class="flex">
              <brn-radio hlm [value]="getCombinedId(address)">
                <hlm-radio-indicator indicator />
              </brn-radio>
              <app-address-card-checkout
                [address]="address"
                [countryCode]="getCountryCode(address.countryId)"
                (editChange)="onEdit(address)"
              />
            </div>
          } @empty {
            <p class="text-center">No addresses found</p>
          }
        </div>
      </hlm-radio-group>
    } @else {
      <div class="flex items-center justify-center">
        <hlm-spinner />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressListCheckoutComponent {
  private getAddressCheckoutService = inject(GetAddressCheckoutService);
  private selectedAddressService = inject(SelectedAddressService);
  private countryService = inject(CountriesService);

  editChange = output<void>();

  protected addresses = this.getAddressCheckoutService.addresses;

  protected isInitialLoading = this.getAddressCheckoutService.isInitialLoading;

  protected combinedIds = this.getAddressCheckoutService.combinedIds;

  protected getCombinedId(address: {
    addressId: number;
    receiverId: number;
  }): string {
    return this.getAddressCheckoutService.getCombinedId(address);
  }

  protected onEdit(data: AddressAndReceiverData): void {
    this.selectedAddressService.setSelectedAddress(data);
    this.editChange.emit();
  }

  protected getCountryCode(countryId: number): string {
    return (
      this.countryService.countries().find((c) => c.id === countryId)?.code ??
      'N/A'
    );
  }
}
