import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../data-access/auth.service';

export const isNotAuthenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.user$.pipe(
    map((user) => (!user ? true : router.parseUrl('/'))),
  );
};
