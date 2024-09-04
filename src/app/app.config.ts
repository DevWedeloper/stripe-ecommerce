import { provideFileRouter } from '@analogjs/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import {
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { provideTrpcClient } from 'src/trpc-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFileRouter(
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    provideTrpcClient(),
    provideNgxStripe(environment.stripePublishableKey),
  ],
};
