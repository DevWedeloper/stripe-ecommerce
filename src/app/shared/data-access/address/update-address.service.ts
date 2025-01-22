import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, filter, map, share, withLatestFrom } from 'rxjs';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { UpdateAddressData } from 'src/db/types';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class UpdateAddressService {
  private _trpc = inject(TrpcClient);
  private authService = inject(AuthService);

  private updateAddressTrigger$ = new BehaviorSubject<Omit<
    UpdateAddressData,
    'userId'
  > | null>(null);

  private updateAddress$ = this.updateAddressTrigger$.pipe(
    filter(Boolean),
    withLatestFrom(this.authService.user$),
    map(([data, user]) => {
      if (!user) {
        throw new Error('User is not authenticated.');
      }
      return {
        ...data,
        userId: user.id,
      };
    }),
    materializeAndShare((data) =>
      this._trpc.addresses.updateAddress.mutate(data),
    ),
  );

  updateAddressSuccess$ = this.updateAddress$.pipe(successStream(), share());

  updateAddressError$ = this.updateAddress$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.updateAddressTrigger$.pipe(filter(Boolean)),
    success: this.updateAddressSuccess$,
    error: this.updateAddressError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.updateAddressError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  updateAddress(data: Omit<UpdateAddressData, 'userId'>): void {
    this.updateAddressTrigger$.next(data);
  }
}
