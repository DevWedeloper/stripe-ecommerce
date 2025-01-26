import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, materialize, merge, share } from 'rxjs';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { EmailUpdate } from 'src/app/shared/types/auth';
import {
  errorStream,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError, showSuccess } from 'src/app/shared/utils/toast';

@Injectable({
  providedIn: 'root',
})
export class UpdateEmailService {
  private authService = inject(AuthService);

  private updateEmail$ = this.authService.updateEmail$.pipe(
    materialize(),
    share(),
  );

  private updateEmailSucces$ = this.updateEmail$.pipe(successStream(), share());

  updateEmailSuccessWithData$ = this.updateEmailSucces$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
  );

  private updateEmailSuccessWithError$ = this.updateEmailSucces$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private updateEmailError$ = this.updateEmail$.pipe(errorStream(), share());

  error$ = merge(
    this.updateEmailSuccessWithError$,
    this.updateEmailError$,
  ).pipe(share());

  private status$ = statusStream({
    loading: this.authService.updateEmailTrigger$,
    success: this.updateEmailSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.updateEmailSuccessWithData$
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

  updateEmail(data: EmailUpdate): void {
    this.authService.updateEmail(data);
  }
}
