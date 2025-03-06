import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, filter, share } from 'rxjs';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class DeleteAddressService {
  private _trpc = inject(TrpcClient);

  private deleteAddressTrigger$ = new BehaviorSubject<{
    addressId: number;
    receiverId: number;
  } | null>(null);

  private deleteAddress$ = this.deleteAddressTrigger$.pipe(
    filter(Boolean),
    materializeAndShare((data) =>
      this._trpc.addresses.deleteAddress.mutate(data),
    ),
  );

  deleteAddressSuccess$ = this.deleteAddress$.pipe(successStream(), share());

  private deleteAddressError$ = this.deleteAddress$.pipe(
    errorStream(),
    share(),
  );

  private status$ = statusStream({
    loading: this.deleteAddressTrigger$.pipe(filter(Boolean)),
    success: this.deleteAddressSuccess$,
    error: this.deleteAddressError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.deleteAddressError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  deleteAddress(addressId: number, receiverId: number): void {
    this.deleteAddressTrigger$.next({ addressId, receiverId });
  }

  isSelectedLoading(addressId: number, receiverId: number): boolean {
    return (
      this.isLoading() &&
      this.deleteAddressTrigger$.value?.addressId === addressId &&
      this.deleteAddressTrigger$.value?.receiverId === receiverId
    );
  }
}
