import { injectRequest } from '@analogjs/router/tokens';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  effect,
  inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  signal,
  TransferState,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthTokenResponse } from '@supabase/supabase-js';
import { filter, map, merge, of, share, Subject, tap } from 'rxjs';
import { getEnvVar } from 'src/env';
import { TrpcClient } from 'src/trpc-client';
import { AuthService } from '../../shared/data-access/auth.service';
import {
  errorStream,
  materializeAndShare,
  successStream,
} from '../../shared/utils/rxjs';
import { showError } from '../../shared/utils/toast';

type RequestMetadata = {
  referer: string;
  baseUrl: string;
  originalUrl: string;
};

const requestMetadataKey = makeStateKey<RequestMetadata>('requestMetadata');
const exchangeCodeForSessionKey = makeStateKey<AuthTokenResponse>(
  'exchangeCodeForSession',
);

@Injectable()
export class MagicLinkService {
  private PLATFORM_ID = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private _trpc = inject(TrpcClient);
  private authService = inject(AuthService);
  private request = injectRequest();

  private exchangeCodeForSessionTriggerSubject$ = new Subject<string>();

  private exchangeCodeForSession$ =
    this.exchangeCodeForSessionTriggerSubject$.pipe(
      materializeAndShare((code) => {
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
    );

  private exchangeCodeForSessionSuccess$ = this.exchangeCodeForSession$.pipe(
    successStream(),
    tap(({ data }) => this.authService.setUser(data.user)),
    share(),
  );

  private exchangeCodeForSessionSuccessWithError$ =
    this.exchangeCodeForSessionSuccess$.pipe(
      filter((data) => data.error !== null),
      map((data) => data.error),
    );

  private exchangeCodeForSessionError$ =
    this.exchangeCodeForSession$.pipe(errorStream());

  private error$ = merge(
    this.exchangeCodeForSessionSuccessWithError$,
    this.exchangeCodeForSessionError$,
  ).pipe(share());

  private errorFromRedirect = signal<string | null>(null);

  clearUrl = signal(false);

  constructor() {
    effect(() => {
      const error = this.errorFromRedirect();
      if (error && isPlatformBrowser(this.PLATFORM_ID)) {
        untracked(() => showError(error));
      }
    });

    this.error$
      .pipe(
        filter(() => isPlatformBrowser(this.PLATFORM_ID)),
        takeUntilDestroyed(),
      )
      .subscribe((error) => showError(error.message));
  }

  checkIfRedirectedFromMagicLink(): void {
    const requestMetadata = this.getRequestMetadata();

    if (!requestMetadata) {
      console.warn('requestMetadataKey was not set.');
      return;
    }

    const { referer, baseUrl, originalUrl } = requestMetadata;
    const emailSenderUrl = getEnvVar('VITE_EMAIL_SENDER_URL');
    const normalizedEmailSenderUrl = normalizeUrl(emailSenderUrl);
    const normalizedReferer = normalizeUrl(referer);

    if (normalizedEmailSenderUrl !== normalizedReferer) {
      return;
    }

    const { searchParams } = new URL(originalUrl || '', baseUrl);

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    this.clearUrl.set(true);

    if (code) {
      this.exchangeCodeForSessionTriggerSubject$.next(code);
      return;
    }

    if (error && errorCode && errorDescription) {
      const message = `${errorCode} (${error}): ${errorDescription}`;
      this.errorFromRedirect.set(message);
      return;
    }
  }

  private getRequestMetadata(): RequestMetadata | null {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      const request = this.transferState.get(requestMetadataKey, null);

      return request;
    }

    const referer = this.request?.headers.referer || '';
    const baseUrl = `${this.request?.headers['x-forwarded-proto'] || 'http'}://${
      this.request?.headers['host']
    }`;
    const originalUrl = this.request?.originalUrl || '';

    const data = {
      referer,
      baseUrl,
      originalUrl,
    };

    this.transferState.set(requestMetadataKey, data);

    return data;
  }
}

const normalizeUrl = (url: string) =>
  url.endsWith('/') ? url.slice(0, -1) : url;
