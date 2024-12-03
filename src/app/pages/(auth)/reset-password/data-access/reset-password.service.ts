import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, map, materialize, merge, share } from 'rxjs';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { PasswordUpdate } from 'src/app/shared/types/auth';
import {
  errorStream,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError, showSuccess } from 'src/app/shared/utils/toast';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  private router = inject(Router);
  private authService = inject(AuthService);

  private resetPassword$ = this.authService.updatePassword$.pipe(
    materialize(),
    share(),
  );

  private resetPasswordSucces$ = this.resetPassword$.pipe(
    successStream(),
    share(),
  );

  private resetPasswordSuccessWithData$ = this.resetPasswordSucces$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
  );

  private resetPasswordSuccessWithError$ = this.resetPasswordSucces$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private resetPasswordError$ = this.resetPassword$.pipe(
    errorStream(),
    share(),
  );

  error$ = merge(
    this.resetPasswordSuccessWithError$,
    this.resetPasswordError$,
  ).pipe(share());

  private status$ = statusStream({
    loading: this.authService.updatePasswordTrigger$,
    success: this.resetPasswordSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.resetPasswordSuccessWithData$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.router.navigate(['/']);
        showSuccess('Password has been reset successfully.');
      });

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  resetPassword(data: PasswordUpdate): void {
    this.authService.updatePassword(data);
  }
}
