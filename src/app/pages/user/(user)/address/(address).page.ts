import { RouteMeta } from '@analogjs/router';
import { Component } from '@angular/core';
import { metaWith } from 'src/app/shared/utils/meta';
import { GetAddressService } from './data-access/get-address.service';
import { AddressListComponent } from './feature/address-list.component';
import { CreateAddressButtonComponent } from './feature/create-address-button.component';
import { LoadMoreAddressComponent } from './feature/load-more-address.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Address',
    'Add or update your shipping address for future orders.',
  ),
  title: 'Stripe Ecommerce | Address',
};

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    CreateAddressButtonComponent,
    AddressListComponent,
    LoadMoreAddressComponent,
  ],
  providers: [GetAddressService],
  template: `
    <app-create-address-button class="mb-4 block" />
    <div class="flex flex-col items-center gap-4">
      <app-address-list class="w-full" />
      <app-load-more-address />
    </div>
  `,
})
export default class AddressPageComponent {}
