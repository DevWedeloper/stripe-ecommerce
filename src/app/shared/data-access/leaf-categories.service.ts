import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { materialize, share, shareReplay } from 'rxjs';
import { TrpcClient } from 'src/trpc-client';
import { errorStream, successStream } from '../utils/rxjs';
import { showError } from '../utils/toast';

@Injectable({
  providedIn: 'root',
})
export class LeafCategoriesService {
  private _trpc = inject(TrpcClient);

  private leafCategories$ = this._trpc.categories.getAllLeaf
    .query()
    .pipe(materialize(), share());

  private leafCategoriesSuccess$ = this.leafCategories$.pipe(
    successStream(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private leafCategoriesError$ = this.leafCategories$.pipe(
    errorStream(),
    share(),
  );

  leafCategories = toSignal(this.leafCategoriesSuccess$, {
    initialValue: [],
  });

  constructor() {
    this.leafCategoriesError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }
}
