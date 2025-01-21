import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { filter, materialize, share, shareReplay } from 'rxjs';
import { TrpcClient } from 'src/trpc-client';
import { errorStream, successStream } from '../utils/rxjs';
import { showError } from '../utils/toast';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private _trpc = inject(TrpcClient);
  private PLATFORM_ID = inject(PLATFORM_ID);

  private countries$ = this._trpc.countries.getAll
    .query()
    .pipe(pendingUntilEvent(), materialize(), share());

  private countriesSuccess$ = this.countries$.pipe(
    successStream(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private countriesError$ = this.countries$.pipe(errorStream(), share());

  countries = toSignal(this.countriesSuccess$, {
    initialValue: [],
  });

  constructor() {
    this.countriesError$
      .pipe(
        filter(() => isPlatformBrowser(this.PLATFORM_ID)),
        takeUntilDestroyed(),
      )
      .subscribe((error) => showError(error.message));
  }
}
