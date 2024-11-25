import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, merge, share, Subject } from 'rxjs';
import { UserRegistration } from 'src/app/shared/types/auth';
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
export class SignUpService {
  private _trpc = inject(TrpcClient);

  private signUpTrigger$ = new Subject<UserRegistration>();

  private signUp$ = this.signUpTrigger$.pipe(
    materializeAndShare((data) => this._trpc.auth.signUp.mutate(data)),
  );

  private signUpSuccess$ = this.signUp$.pipe(successStream(), share());

  signUpSuccessWithData$ = this.signUpSuccess$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
  );

  private signUpSuccessWithError$ = this.signUpSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private signUpError$ = this.signUp$.pipe(errorStream(), share());

  error$ = merge(this.signUpSuccessWithError$, this.signUpError$).pipe(share());

  private status$ = statusStream({
    loading: this.signUpTrigger$,
    success: this.signUpSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.signUpSuccessWithData$
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

  signUp(data: UserRegistration): void {
    this.signUpTrigger$.next(data);
  }
}
