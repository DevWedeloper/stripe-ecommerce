import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, share, Subject, withLatestFrom } from 'rxjs';
import { Address } from 'src/app/pages/user/(user)/address/types/address';
import { AuthService } from 'src/app/shared/data-access/auth.service';
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
export class CreateAddressService {
  private _trpc = inject(TrpcClient);
  private authService = inject(AuthService);

  private createAddressTrigger$ = new Subject<Address>();

  private createAddress$ = this.createAddressTrigger$.pipe(
    withLatestFrom(this.authService.user$),
    map(([data, user]) => {
      if (!user) {
        throw new Error('User is not authenticated.');
      }
      return { userId: user.id, data };
    }),
    materializeAndShare((data) =>
      this._trpc.addresses.createAddress.mutate(data),
    ),
  );

  createAddressSuccess$ = this.createAddress$.pipe(successStream(), share());

  createAddressError$ = this.createAddress$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.createAddressTrigger$,
    success: this.createAddressSuccess$,
    error: this.createAddressError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.createAddressError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  createAddress(address: Address) {
    this.createAddressTrigger$.next(address);
  }
}
