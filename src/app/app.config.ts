import { provideFileRouter } from '@analogjs/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { provideTrpcClient } from 'src/trpc-client';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFileRouter(
      withComponentInputBinding(),
      withInMemoryScrolling({
        get scrollPositionRestoration() {
          if (typeof window === 'undefined') {
            return 'enabled' as const;
          }

          const { pathname } = window.location;

          if (pathname.startsWith('/product')) {
            return 'disabled' as const;
          }

          return 'enabled' as const;
        },
      }),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    provideTrpcClient(),
    provideNgxStripe(environment.stripePublishableKey),
  ],
};
