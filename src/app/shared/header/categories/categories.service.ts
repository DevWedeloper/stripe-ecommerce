import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, materialize, merge, share } from 'rxjs';
import { TrpcClient } from 'src/trpc-client';
import { errorStream, initialLoading, successStream } from '../../utils/rxjs';
import { showError } from '../../utils/toast';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private _trpc = inject(TrpcClient);

  private categories$ = this._trpc.categories.getTree
    .query()
    .pipe(materialize(), share());

  private categoriesSuccess$ = this.categories$.pipe(successStream(), share());

  private categoriesError$ = this.categories$.pipe(errorStream(), share());

  private status$ = merge(
    this.categoriesSuccess$.pipe(map(() => 'success' as const)),
    this.categoriesError$.pipe(map(() => 'error' as const)),
  );

  private initialLoading$ = this.status$.pipe(initialLoading());

  categories = toSignal(this.categoriesSuccess$, {
    initialValue: [],
  });

  isInitialLoading = toSignal(this.initialLoading$, {
    initialValue: true,
  });

  hasError = toSignal(this.categoriesError$.pipe(map(() => true)), {
    initialValue: false,
  });

  constructor() {
    this.categoriesError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }
}
