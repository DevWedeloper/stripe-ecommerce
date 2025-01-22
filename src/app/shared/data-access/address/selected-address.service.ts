import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge, shareReplay, Subject } from 'rxjs';
import { AddressReceiverLink } from 'src/db/types';
import { UpdateAddressService } from './update-address.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedAddressService {
  private updateAddressService = inject(UpdateAddressService);

  private setSelectedAddress$ = new Subject<AddressReceiverLink>();

  selectedAddress$ = merge(
    this.setSelectedAddress$,
    this.updateAddressService.updateAddressSuccess$,
  ).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  selectedAddress = toSignal(this.selectedAddress$, { initialValue: null });

  setSelectedAddress(data: AddressReceiverLink): void {
    this.setSelectedAddress$.next(data);
  }
}
