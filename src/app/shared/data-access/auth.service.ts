import { injectRequest } from '@analogjs/router/tokens';
import { isPlatformServer } from '@angular/common';
import {
  effect,
  inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { pendingUntilEvent, toSignal } from '@angular/core/rxjs-interop';
import { AuthTokenResponse, UserResponse } from '@supabase/supabase-js';
import {
  map,
  merge,
  of,
  share,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { TrpcClient, TrpcHeaders } from 'src/trpc-client';
import { EmailUpdate, PasswordUpdate, UserCredentials } from '../types/auth';

const getUserKey = makeStateKey<UserResponse>('getUser');
const exchangeCodeForSessionKey = makeStateKey<AuthTokenResponse>(
  'exchangeCodeForSession',
);

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private PLATFORM_ID = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private _trpc = inject(TrpcClient);
  private request = injectRequest();

  private getUserTriggerSubject$ = new Subject<void>();
  private loginTriggerSubject$ = new Subject<UserCredentials>();
  private updateEmailTriggerSubject$ = new Subject<EmailUpdate>();
  private updatePasswordTriggerSubject$ = new Subject<PasswordUpdate>();
  private exchangeCodeForSessionTriggerSubject$ = new Subject<string>();
  private signOutTriggerSubject$ = new Subject<void>();
  private deleteUserTriggerSubject$ = new Subject<string>();

  loginTrigger$ = this.loginTriggerSubject$.asObservable();
  updateEmailTrigger$ = this.updateEmailTriggerSubject$.asObservable();
  updatePasswordTrigger$ = this.updatePasswordTriggerSubject$.asObservable();
  deleteUserTrigger$ = this.deleteUserTriggerSubject$.asObservable();

  getUser$ = this.getUserTriggerSubject$.pipe(
    switchMap(() => {
      if (isPlatformServer(this.PLATFORM_ID)) {
        return this._trpc.auth.getUser.query().pipe(
          tap((data) => {
            console.log('setting getUserKey...');
            this.transferState.set(getUserKey, data);
          }),
        );
      } else {
        const data = this.transferState.get(getUserKey, null);
        if (!data) {
          throw new Error('getUserKey was not set');
        }
        return of(data);
      }
    }),
    share(),
  );

  login$ = this.loginTriggerSubject$.pipe(
    switchMap((data) => this._trpc.auth.signInWithPassword.mutate(data)),
    share(),
  );

  updateEmail$ = this.updateEmailTriggerSubject$.pipe(
    switchMap((data) => this._trpc.auth.updateEmail.mutate(data)),
    share(),
  );

  updatePassword$ = this.updatePasswordTriggerSubject$.pipe(
    switchMap((data) => this._trpc.auth.updatePassword.mutate(data)),
    share(),
  );

  exchangeCodeForSession$ = this.exchangeCodeForSessionTriggerSubject$.pipe(
    switchMap((code) => {
      if (isPlatformServer(this.PLATFORM_ID)) {
        return this._trpc.auth.exchangeCodeForSession
          .mutate({ code })
          .pipe(
            tap((data) =>
              this.transferState.set(exchangeCodeForSessionKey, data),
            ),
          );
      } else {
        const data = this.transferState.get(exchangeCodeForSessionKey, null);
        if (!data) {
          throw new Error('exchangeCodeForSessionKey was not set');
        }
        return of(data);
      }
    }),
    share(),
  );

  signOut$ = this.signOutTriggerSubject$.pipe(
    switchMap(() => this._trpc.auth.signOut.mutate()),
    share(),
  );

  deleteUser$ = this.deleteUserTriggerSubject$.pipe(
    switchMap((id) => this._trpc.auth.deleteUser.mutate({ id })),
    share(),
  );

  user$ = merge(
    this.getUser$.pipe(map(({ data }) => data.user)),
    this.login$.pipe(map(({ data }) => data.user)),
    this.updateEmail$.pipe(map(({ data }) => data.user)),
    this.updatePassword$.pipe(map(({ data }) => data.user)),
    this.exchangeCodeForSession$.pipe(map(({ data }) => data.user)),
    this.signOut$.pipe(map(() => null)),
    this.deleteUser$.pipe(map(() => null)),
  ).pipe(pendingUntilEvent(), shareReplay({ bufferSize: 1, refCount: true }));

  user = toSignal(this.user$, { initialValue: null });

  constructor() {
    effect(() =>
      TrpcHeaders.update((headers) => ({
        ...headers,
        cookie: this.request?.headers.cookie,
      })),
    );
  }

  getUser(): void {
    this.getUserTriggerSubject$.next();
  }

  login(data: UserCredentials) {
    this.loginTriggerSubject$.next(data);
  }

  updateEmail(data: EmailUpdate) {
    this.updateEmailTriggerSubject$.next(data);
  }

  updatePassword(data: PasswordUpdate) {
    this.updatePasswordTriggerSubject$.next(data);
  }

  exchangeCodeForSession(data: string) {
    this.exchangeCodeForSessionTriggerSubject$.next(data);
  }

  signOut() {
    this.signOutTriggerSubject$.next();
  }

  deleteUser(id: string) {
    this.deleteUserTriggerSubject$.next(id);
  }
}
