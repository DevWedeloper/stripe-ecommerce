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
import { getEnvVar } from 'src/env';
import { showError } from '../../shared/utils/toast';

type RequestMetadata = {
  referer: string;
  baseUrl: string;
  originalUrl: string;
};

const requestMetadataKey = makeStateKey<RequestMetadata>('requestMetadata');

@Injectable()
export class MagicLinkService {
  private PLATFORM_ID = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private request = injectRequest();

  private errorFromRedirect = signal<string | null>(null);

  clearUrl = signal(false);

  constructor() {
    effect(() => {
      const error = this.errorFromRedirect();
      if (error && isPlatformBrowser(this.PLATFORM_ID)) {
        untracked(() => showError(error));
      }
    });
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

    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    this.clearUrl.set(true);

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
