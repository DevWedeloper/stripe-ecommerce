import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
export class UpdatePasswordService {
  private authService = inject(AuthService);

  private updatePassword$ = this.authService.updatePassword$.pipe(
    materialize(),
    share(),
  );

  private updatePasswordSucces$ = this.updatePassword$.pipe(
    successStream(),
    share(),
  );

  updatePasswordSuccessWithData$ = this.updatePasswordSucces$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
  );

  private updatePasswordSuccessWithError$ = this.updatePasswordSucces$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private updatePasswordError$ = this.updatePassword$.pipe(
    errorStream(),
    share(),
  );

  error$ = merge(
    this.updatePasswordSuccessWithError$,
    this.updatePasswordError$,
  ).pipe(share());

  private status$ = statusStream({
    loading: this.authService.updatePasswordTrigger$,
    success: this.updatePasswordSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.updatePasswordSuccessWithData$
      .pipe(takeUntilDestroyed())
      .subscribe(() => showSuccess('Password updated successfully.'));

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  updatePassword(data: PasswordUpdate): void {
    this.authService.updatePassword(data);
  }
}
