import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import { SelectedAddressService } from 'src/app/shared/data-access/address/selected-address.service';
import { CountriesService } from 'src/app/shared/data-access/countries.service';
import { AddressAndReceiverData } from 'src/db/types';
import { DeleteAddressService } from '../data-access/delete-address.service';
import { GetAddressService } from '../data-access/get-address.service';
import { SetAsDefaultAddressService } from '../data-access/set-as-default-address.service';
import { AddressCardComponent } from '../ui/address-card.component';
import { UpdateAddressComponent } from './update-address.component';

@Component({
  selector: 'app-address-list',
  imports: [AddressCardComponent, HlmSpinnerComponent],
  host: {
    class: 'flex flex-col gap-4',
  },
  template: `
    @if (!isInitialLoading()) {
      @for (address of addresses(); track $index) {
        <app-address-card
          [address]="address"
          [countryCode]="getCountryCode(address.countryId)"
          [isSetDefaultLoading]="
            isSelectedSetAsDefaultLoading(address.addressId, address.receiverId)
          "
          [isDeleteLoading]="
            isSelectedDeleteLoading(address.addressId, address.receiverId)
          "
          (editChange)="onEdit(address)"
          (setAsDefaultChange)="
            onSetAsDefault(address.addressId, address.receiverId)
          "
          (deleteChange)="onDelete(address.addressId, address.receiverId)"
        />
      } @empty {
        <p class="text-center">No addresses found</p>
      }
    } @else {
      <div class="flex items-center justify-center">
        <hlm-spinner />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressListComponent {
  private _hlmDialogService = inject(HlmDialogService);
  private getAddressService = inject(GetAddressService);
  private setAsDefaultAddressService = inject(SetAsDefaultAddressService);
  private deleteAddressService = inject(DeleteAddressService);
  private selectedAddressService = inject(SelectedAddressService);
  private countryService = inject(CountriesService);

  protected addresses = this.getAddressService.addresses;

  protected isInitialLoading = this.getAddressService.isInitialLoading;

  protected onEdit(data: AddressAndReceiverData): void {
    this.selectedAddressService.setSelectedAddress(data);
    this._hlmDialogService.open(UpdateAddressComponent, {
      contentClass: 'flex',
    });
  }

  protected onSetAsDefault(addressId: number, receiverId: number): void {
    this.setAsDefaultAddressService.setAsDefault(addressId, receiverId);
  }

  protected onDelete(addressId: number, receiverId: number): void {
    this.deleteAddressService.deleteAddress(addressId, receiverId);
  }

  protected isSelectedSetAsDefaultLoading(
    addressId: number,
    receiverId: number,
  ): boolean {
    return this.setAsDefaultAddressService.isSelectedLoading(
      addressId,
      receiverId,
    );
  }

  protected isSelectedDeleteLoading(
    addressId: number,
    receiverId: number,
  ): boolean {
    return this.deleteAddressService.isSelectedLoading(addressId, receiverId);
  }

  protected getCountryCode(countryId: number): string {
    return (
      this.countryService.countries().find((c) => c.id === countryId)?.code ??
      'N/A'
    );
  }
}
