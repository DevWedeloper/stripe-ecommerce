import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  EMPTY,
  map,
  merge,
  share,
  startWith,
  Subject,
  take,
} from 'rxjs';
import { TrpcClient } from 'src/trpc-client';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private _trpc = inject(TrpcClient);

  private error$ = new Subject<Error>();

  private categories$ = this._trpc.categories.getTree.query().pipe(
    catchError((error) => {
      this.error$.next(error);
      return EMPTY;
    }),
    share(),
  );

  private status$ = merge(
    this.categories$.pipe(map(() => 'success' as const)),
    this.error$.pipe(map(() => 'error' as const)),
  ).pipe(startWith('initial' as const), share());

  private initialLoading$ = this.status$.pipe(
    map(() => false),
    take(1),
    startWith(true),
  );

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  categories = toSignal(this.categories$, {
    initialValue: [],
  });

  initialLoading = toSignal(this.initialLoading$, {
    initialValue: true,
  });

  hasError = computed(() => this.status() === 'error');
}
