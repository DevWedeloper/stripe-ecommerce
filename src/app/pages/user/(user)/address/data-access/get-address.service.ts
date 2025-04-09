import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  merge,
  scan,
  share,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { CreateAddressService } from 'src/app/shared/data-access/address/create-address.service';
import { UpdateAddressService } from 'src/app/shared/data-access/address/update-address.service';
import {
  errorStream,
  finalizedStatusStream,
  initialLoading,
  materializeAndShare,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { TrpcClient } from 'src/trpc-client';
import { DeleteAddressService } from './delete-address.service';
import { SetAsDefaultAddressService } from './set-as-default-address.service';

@Injectable()
export class GetAddressService {
  private _trpc = inject(TrpcClient);
  private createAddressService = inject(CreateAddressService);
  private updateAddressService = inject(UpdateAddressService);
  private setAsDefaultAddressService = inject(SetAsDefaultAddressService);
  private deleteAddressService = inject(DeleteAddressService);

  private pageSize = 10;

  private nextBatch$ = new Subject<void>();

  private trigger$ = merge(
    this.createAddressService.createAddressSuccess$,
    this.updateAddressService.updateAddressSuccess$,
    this.setAsDefaultAddressService.setAsDefaultSuccess$,
    this.deleteAddressService.deleteAddressSuccess$,
  ).pipe(startWith(undefined));

  private addresses$ = this.trigger$.pipe(
    materializeAndShare(() =>
      this.nextBatch$.pipe(
        startWith(0),
        scan((acc) => acc + 1, 0),
        switchMap((page) =>
          this._trpc.addresses.getByUserId.query({
            page,
            pageSize: this.pageSize,
          }),
        ),
        scan((acc, curr) => ({
          page: curr.page,
          pageSize: curr.pageSize,
          totalPages: curr.totalPages,
          totalAddresses: curr.totalAddresses,
          addresses: [...acc.addresses, ...curr.addresses],
        })),
      ),
    ),
  );

  private addressesSuccess$ = this.addresses$.pipe(
    successStream(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private addressesError$ = this.addresses$.pipe(errorStream(), share());

  private status$ = finalizedStatusStream({
    success: this.addressesSuccess$,
    error: this.addressesError$,
  });

  private initialLoading$ = this.status$.pipe(initialLoading());

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

  addresses = computed(() => this.addressData().addresses);

  canLoadMore = computed(() => this.totalPages() > this.page());

  isInitialLoading = toSignal(this.initialLoading$, { initialValue: true });

  constructor() {
    this.addressesError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  nextBatch(): void {
    this.nextBatch$.next();
  }
}
