import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AddressAndReceiverInsert } from 'src/db/types';

@Injectable({
  providedIn: 'root',
})
export class FinalizedAddressService {
  private addressTrigger$ =
    new BehaviorSubject<AddressAndReceiverInsert | null>(null);

  address$ = this.addressTrigger$.asObservable();

  setAddress(data: AddressAndReceiverInsert): void {
    this.addressTrigger$.next(data);
  }
}
