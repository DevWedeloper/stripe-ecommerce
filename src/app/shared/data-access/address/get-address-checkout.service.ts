import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  defer,
  iif,
  map,
  merge,
  of,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { CreateAddressService } from 'src/app/shared/data-access/address/create-address.service';
import { UpdateAddressService } from 'src/app/shared/data-access/address/update-address.service';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import {
  errorStream,
  finalizedStatusStream,
  initialLoading,
  materializeAndShare,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { AddressAndReceiverData } from 'src/db/types';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class GetAddressCheckoutService {
  private _trpc = inject(TrpcClient);
  private authService = inject(AuthService);
  private createAddressService = inject(CreateAddressService);
  private updateAddressService = inject(UpdateAddressService);

  private pageSize = 10;

  private nextBatch$ = new Subject<void>();
  private fetchAddress$ = new Subject<void>();

  private trigger$ = merge(
    this.fetchAddress$,
    this.createAddressService.createAddressSuccess$,
    this.updateAddressService.updateAddressSuccess$,
    this.authService.user$,
  );

  private addresses$ = this.trigger$.pipe(
    withLatestFrom(this.authService.user$),
    materializeAndShare(([_, user]) =>
      iif(
        () => !!user,
        defer(() =>
          this.nextBatch$.pipe(
            startWith(0),
            scan((acc) => acc + 1, 0),
            map((page) => ({
              userId: user!.id,
              page,
              pageSize: this.pageSize,
            })),
            switchMap((data) => this._trpc.addresses.getByUserId.query(data)),
            scan((acc, curr) => ({
              page: curr.page,
              pageSize: curr.pageSize,
              totalPages: curr.totalPages,
              totalAddresses: curr.totalAddresses,
              addresses: [...acc.addresses, ...curr.addresses],
            })),
          ),
        ),
        of({
          page: 0,
          pageSize: this.pageSize,
          totalPages: 0,
          totalAddresses: 0,
          addresses: [],
        }),
      ),
    ),
  );

  private addressesSuccess$ = this.addresses$.pipe(successStream());

  private addressesError$ = this.addresses$.pipe(errorStream());

  private status$ = finalizedStatusStream({
    success: this.addressesSuccess$,
    error: this.addressesError$,
  });

  private initialLoading$ = this.status$.pipe(initialLoading());

  private defaultAddress$ = this.addressesSuccess$.pipe(
    map((data) => {
      const defaultAddress =
        data.addresses.find((address) => address.isDefault) ?? null;

      if (defaultAddress) {
        const defaultAddressLink: AddressAndReceiverData = {
          addressId: defaultAddress.addressId,
          receiverId: defaultAddress.receiverId,
          addressLine1: defaultAddress.addressLine1,
          addressLine2: defaultAddress.addressLine2,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.postalCode,
          countryId: defaultAddress.countryId,
          fullName: defaultAddress.fullName,
          isDefault: defaultAddress.isDefault,
        };

        return defaultAddressLink;
      }

      return null;
    }),
  );

  private addressData = toSignal(this.addressesSuccess$, {
    initialValue: {
      page: 1,
      pageSize: 10,
      totalPages: 0,
      totalAddresses: 0,
      addresses: [],
    },
  });

  private page = computed(() => this.addressData().page);
  private totalPages = computed(() => this.addressData().totalPages);

  combinedIds = linkedSignal({
    source: toSignal(this.defaultAddress$),
    computation: (address) =>
      address ? `${address.addressId}${address.receiverId}` : null,
  });

  private getSelectedAddress$ = toObservable(this.combinedIds).pipe(
    withLatestFrom(this.addressesSuccess$),
    map(([combinedId, data]) =>
      data.addresses.find(
        (address) => this.getCombinedId(address) === combinedId,
      ),
    ),
  );

  selectedAddress$ = merge(this.getSelectedAddress$, this.defaultAddress$).pipe(
    startWith(null),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  addresses = computed(() => this.addressData().addresses);

  canLoadMore = computed(() => this.totalPages() > this.page());

  isInitialLoading = toSignal(this.initialLoading$, { initialValue: true });

  selectedAddress = toSignal(this.selectedAddress$, { initialValue: null });

  constructor() {
    this.fetchAddress();

    this.addressesError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  nextBatch(): void {
    this.nextBatch$.next();
  }

  fetchAddress(): void {
    this.fetchAddress$.next();
  }

  getCombinedId(address: { addressId: number; receiverId: number }): string {
    return `${address.addressId}${address.receiverId}`;
  }
}
