import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, map, materialize, merge, share } from 'rxjs';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { UserCredentials } from 'src/app/shared/types/auth';
import {
  errorStream,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private router = inject(Router);
  private authService = inject(AuthService);

  private login$ = this.authService.login$.pipe(materialize(), share());

  private loginSuccess$ = this.login$.pipe(successStream(), share());

  private loginSuccessWithData$ = this.loginSuccess$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
  );

  private loginSuccessWithError$ = this.loginSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private loginError$ = this.login$.pipe(errorStream(), share());

  error$ = merge(this.loginSuccessWithError$, this.loginError$).pipe(share());

  private status$ = statusStream({
    loading: this.authService.loginTrigger$,
    success: this.loginSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.loginSuccessWithData$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.router.navigate(['/']));

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  login(data: UserCredentials) {
    this.authService.login(data);
  }
}
