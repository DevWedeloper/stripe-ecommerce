import { Component } from '@angular/core';
import { AddressListComponent } from './feature/address-list.component';
import { CreateAddressButtonComponent } from './feature/create-address-button.component';
import { LoadMoreAddressComponent } from './feature/load-more-address.component';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    CreateAddressButtonComponent,
    AddressListComponent,
    LoadMoreAddressComponent,
  ],
  template: `
    <app-create-address-button class="mb-4 block" />
    <div class="flex flex-col items-center gap-4">
      <app-address-list class="w-full" />
      <app-load-more-address />
    </div>
  `,
})
export default class AddressPageComponent {}
