import { provideFileRouter } from '@analogjs/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { withInMemoryScrolling } from '@angular/router';
import { provideTrpcClient } from 'src/trpc-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFileRouter(
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    provideTrpcClient(),
  ],
};
