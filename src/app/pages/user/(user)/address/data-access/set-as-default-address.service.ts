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
export class SetAsDefaultAddressService {
  private _trpc = inject(TrpcClient);

  private setAsDefaultTrigger$ = new BehaviorSubject<{
    addressId: number;
    receiverId: number;
  } | null>(null);

  private setAsDefault$ = this.setAsDefaultTrigger$.pipe(
    filter(Boolean),
    materializeAndShare((data) =>
      this._trpc.addresses.setAsDefault.mutate(data),
    ),
  );

  setAsDefaultSuccess$ = this.setAsDefault$.pipe(successStream(), share());

  private setAsDefaultError$ = this.setAsDefault$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.setAsDefaultTrigger$.pipe(filter(Boolean)),
    success: this.setAsDefaultSuccess$,
    error: this.setAsDefaultError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.setAsDefaultError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  setAsDefault(addressId: number, receiverId: number): void {
    this.setAsDefaultTrigger$.next({ addressId, receiverId });
  }

  isSelectedLoading(addressId: number, receiverId: number): boolean {
    return (
      this.isLoading() &&
      this.setAsDefaultTrigger$.value?.addressId === addressId &&
      this.setAsDefaultTrigger$.value?.receiverId === receiverId
    );
  }
}
