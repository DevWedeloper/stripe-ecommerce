import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, map, materialize, merge, share } from 'rxjs';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import {
  errorStream,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError, showSuccess } from 'src/app/shared/utils/toast';

@Injectable({
  providedIn: 'root',
})
export class DeleteUserService {
  private router = inject(Router);
  private authService = inject(AuthService);

  private deleteUser$ = this.authService.deleteUser$.pipe(
    materialize(),
    share(),
  );

  private deleteUserSuccess$ = this.deleteUser$.pipe(successStream(), share());

  deleteUserSuccessWithData$ = this.deleteUserSuccess$.pipe(
    filter((data) => data.error === null),
  );

  private deleteUserSuccessWithError$ = this.deleteUserSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private deleteUserError$ = this.deleteUser$.pipe(errorStream(), share());

  error$ = merge(this.deleteUserSuccessWithError$, this.deleteUserError$).pipe(
    share(),
  );

  private status$ = statusStream({
    loading: this.authService.deleteUserTrigger$,
    success: this.deleteUserSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.deleteUserSuccessWithData$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.router.navigate(['/']);
      showSuccess('Account deleted successfully.');
    });

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  deleteUser(): void {
    const user = this.authService.user();
    if (!user) {
      throw new Error('User is not authenticated.');
    }
    this.authService.deleteUser(user.id);
  }
}
