import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, merge, share, Subject } from 'rxjs';
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
export class DeleteAvatarService {
  private _trpc = inject(TrpcClient);

  private deleteAvatarTrigger$ = new Subject<void>();

  private deleteAvatar$ = this.deleteAvatarTrigger$.pipe(
    materializeAndShare(() => this._trpc.users.deleteAvatarPath.mutate()),
  );

  private deleteAvatarSuccess$ = this.deleteAvatar$.pipe(
    successStream(),
    share(),
  );

  deleteAvatarSuccessWithData$ = this.deleteAvatarSuccess$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
    share(),
  );

  private deleteAvatarSuccessWithError$ = this.deleteAvatarSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private deleteAvatarError$ = this.deleteAvatar$.pipe(errorStream());

  private error$ = merge(
    this.deleteAvatarSuccessWithError$,
    this.deleteAvatarError$,
  ).pipe(share());

  private status$ = statusStream({
    loading: this.deleteAvatarTrigger$,
    success: this.deleteAvatarSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  deleteAvatar(): void {
    this.deleteAvatarTrigger$.next();
  }
}
