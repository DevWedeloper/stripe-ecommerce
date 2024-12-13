import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, merge, share, Subject } from 'rxjs';
import { EmailUpdate } from 'src/app/shared/types/auth';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError, showSuccess } from 'src/app/shared/utils/toast';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordService {
  private _trpc = inject(TrpcClient);

  private forgotPasswordTrigger$ = new Subject<EmailUpdate>();

  private forgotPassword$ = this.forgotPasswordTrigger$.pipe(
    materializeAndShare((data) =>
      this._trpc.auth.resetPasswordForEmail.mutate(data),
    ),
  );

  private forgotPasswordSuccess$ = this.forgotPassword$.pipe(
    successStream(),
    share(),
  );

  private forgotPasswordSuccessWithData$ = this.forgotPasswordSuccess$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
  );

  private forgotPasswordSuccessWithError$ = this.forgotPasswordSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private forgotPasswordError$ = this.forgotPassword$.pipe(
    errorStream(),
    share(),
  );

  error$ = merge(
    this.forgotPasswordSuccessWithError$,
    this.forgotPasswordError$,
  ).pipe(share());

  private status$ = statusStream({
    loading: this.forgotPasswordTrigger$,
    success: this.forgotPasswordSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.forgotPasswordSuccessWithData$
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        showSuccess(
          'A confirmation link has been sent to your email. Kindly click to confirm.',
        ),
      );

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  forgotPassword(data: EmailUpdate) {
    this.forgotPasswordTrigger$.next(data);
  }
}
