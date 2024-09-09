import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  dematerialize,
  filter,
  map,
  materialize,
  merge,
  share,
  startWith,
  take,
} from 'rxjs';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private _trpc = inject(TrpcClient);

  private categories$ = this._trpc.categories.getTree
    .query()
    .pipe(materialize(), share());

  private categoriesSuccess$ = this.categories$.pipe(
    filter((notification) => notification.kind === 'N'),
    dematerialize(),
    share(),
  );

  private categoriesError$ = this.categories$.pipe(
    filter((notification) => notification.kind === 'E'),
    map((notification) => new Error(notification.error)),
  );

  private status$ = merge(
    this.categoriesSuccess$.pipe(map(() => 'success' as const)),
    this.categoriesError$.pipe(map(() => 'error' as const)),
  ).pipe(startWith('initial' as const), share());

  private initialLoading$ = this.status$.pipe(
    map(() => false),
    take(1),
    startWith(true),
  );

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  categories = toSignal(this.categoriesSuccess$, {
    initialValue: [],
  });

  isInitialLoading = toSignal(this.initialLoading$, {
    initialValue: true,
  });

  hasError = computed(() => this.status() === 'error');
}
