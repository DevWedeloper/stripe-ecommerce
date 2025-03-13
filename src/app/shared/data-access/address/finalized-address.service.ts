import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CreateAddressSchema } from 'src/schemas/address';

@Injectable({
  providedIn: 'root',
})
export class FinalizedAddressService {
  private addressTrigger$ = new BehaviorSubject<CreateAddressSchema | null>(
    null,
  );

  address$ = this.addressTrigger$.asObservable();

  setAddress(data: CreateAddressSchema): void {
    this.addressTrigger$.next(data);
  }
}
