import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, map, materialize, merge, share } from 'rxjs';
import { AuthService } from '../../../data-access/auth.service';
import { errorStream, successStream } from '../../../utils/rxjs';
import { showError } from '../../../utils/toast';

@Injectable({
  providedIn: 'root',
})
export class SignOutService {
  private router = inject(Router);
  private authService = inject(AuthService);

  private signOut$ = this.authService.signOut$.pipe(materialize(), share());

  private signOutSuccess$ = this.signOut$.pipe(successStream(), share());

  private signOutSuccessWithoutError$ = this.signOutSuccess$.pipe(
    filter((data) => data.error === null),
  );

  private signOutSuccessWithError$ = this.signOutSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error as NonNullable<typeof data.error>),
  );

  private signOutError$ = this.signOut$.pipe(errorStream(), share());

  private error$ = merge(
    this.signOutSuccessWithError$,
    this.signOutError$,
  ).pipe(share());

  constructor() {
    this.signOutSuccessWithoutError$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.router.navigate(['/']));

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  signOut(): void {
    this.authService.signOut();
  }
}
