import { injectRequest } from '@analogjs/router/tokens';
import { isPlatformBrowser } from '@angular/common';
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
import { filter, map, materialize, merge, share } from 'rxjs';
import { getEnvVar } from 'src/env';
import { errorStream, successStream } from '../utils/rxjs';
import { showError } from '../utils/toast';
import { AuthService } from './auth.service';

type RequestMetadata = {
  referer: string;
  baseUrl: string;
  originalUrl: string;
};

const requestMetadataKey = makeStateKey<RequestMetadata>('requestMetadata');

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private PLATFORM_ID = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private authService = inject(AuthService);
  private request = injectRequest();

  private getUser$ = this.authService.getUser$.pipe(materialize(), share());

  private getUserSuccess$ = this.getUser$.pipe(successStream(), share());

  private getUserSuccessWithError$ = this.getUserSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private getUserError$ = this.getUser$.pipe(errorStream());

  private exchangeCodeForSession$ =
    this.authService.exchangeCodeForSession$.pipe(materialize(), share());

  private exchangeCodeForSessionSuccess$ = this.exchangeCodeForSession$.pipe(
    successStream(),
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
    this.getUserSuccessWithError$,
    this.getUserError$,
    this.exchangeCodeForSessionSuccessWithError$,
    this.exchangeCodeForSessionError$,
  ).pipe(share());

  private errorFromRedirect = signal<string | null>(null);

  clearUrl = signal(false);

  constructor() {
    console.log('AppService initialized');

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
      this.authService.getUser();
      console.warn('requestMetadataKey was not set.');
      return;
    }

    const { referer, baseUrl, originalUrl } = requestMetadata;
    const emailSenderUrl = getEnvVar('VITE_EMAIL_SENDER_URL');
    const normalizedEmailSenderUrl = normalizeUrl(emailSenderUrl);
    const normalizedReferer = normalizeUrl(referer);

    if (normalizedEmailSenderUrl !== normalizedReferer) {
      this.authService.getUser();
      return;
    }

    const { searchParams } = new URL(originalUrl || '', baseUrl);

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    this.clearUrl.set(true);

    if (code) {
      this.authService.exchangeCodeForSession(code);
      return;
    }

    this.authService.getUser();

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

    console.log('setting requestMetadataKey...', data);

    this.transferState.set(requestMetadataKey, data);

    return data;
  }
}

const normalizeUrl = (url: string) =>
  url.endsWith('/') ? url.slice(0, -1) : url;
