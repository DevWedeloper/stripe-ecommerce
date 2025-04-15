import { injectRequest } from '@analogjs/router/tokens';
import { effect, inject, Injectable } from '@angular/core';
import { pendingUntilEvent, toSignal } from '@angular/core/rxjs-interop';
import { User } from '@supabase/supabase-js';
import { map, merge, share, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { TrpcClient, TrpcHeaders } from 'src/trpc-client';
import { EmailUpdate, PasswordUpdate, UserCredentials } from '../types/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _trpc = inject(TrpcClient);
  private request = injectRequest();

  private setUser$ = new Subject<User | null>();
  private loginTriggerSubject$ = new Subject<UserCredentials>();
  private updateEmailTriggerSubject$ = new Subject<EmailUpdate>();
  private updatePasswordTriggerSubject$ = new Subject<PasswordUpdate>();
  private signOutTriggerSubject$ = new Subject<void>();
  private deleteUserTriggerSubject$ = new Subject<string>();

  loginTrigger$ = this.loginTriggerSubject$.asObservable();
  updateEmailTrigger$ = this.updateEmailTriggerSubject$.asObservable();
  updatePasswordTrigger$ = this.updatePasswordTriggerSubject$.asObservable();
  deleteUserTrigger$ = this.deleteUserTriggerSubject$.asObservable();

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

  signOut$ = this.signOutTriggerSubject$.pipe(
    switchMap(() => this._trpc.auth.signOut.mutate()),
    share(),
  );

  deleteUser$ = this.deleteUserTriggerSubject$.pipe(
    switchMap((id) => this._trpc.auth.deleteUser.mutate({ id })),
    share(),
  );

  user$ = merge(
    this.getUserNoCache$().pipe(map(({ data }) => data.user)),
    this.setUser$,
    this.login$.pipe(map(({ data }) => data.user)),
    this.updateEmail$.pipe(map(({ data }) => data.user)),
    this.updatePassword$.pipe(map(({ data }) => data.user)),
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

  getUserAndSet$() {
    return this.getUserNoCache$().pipe(
      map(({ data }) => data.user),
      tap((data) => this.setUser$.next(data)),
    );
  }

  setUser(data: User | null) {
    this.setUser$.next(data);
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

  signOut() {
    this.signOutTriggerSubject$.next();
  }

  deleteUser(id: string) {
    this.deleteUserTriggerSubject$.next(id);
  }

  getUserNoCache$() {
    return this._trpc.auth.getUser.query(undefined, {
      context: { noCache: true },
    });
  }
}
