import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../data-access/auth.service';

export const isAuthenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);

  if (isPlatformServer(platformId)) {
    return authService.user$.pipe(
      map((user) => (user ? true : router.parseUrl('/login'))),
    );
  }

  return authService
    .getUserAndSet$()
    .pipe(map((user) => (user ? true : router.parseUrl('/login'))));
};
