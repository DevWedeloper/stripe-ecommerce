import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { materialize, share, shareReplay } from 'rxjs';
import { TrpcClient } from 'src/trpc-client';
import { errorStream, successStream } from '../utils/rxjs';
import { showError } from '../utils/toast';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private _trpc = inject(TrpcClient);

  private tags$ = this._trpc.tags.getAll.query().pipe(materialize(), share());

  private tagsSuccess$ = this.tags$.pipe(
    successStream(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private tagsError$ = this.tags$.pipe(errorStream(), share());

  tags = toSignal(this.tagsSuccess$, {
    initialValue: [],
  });

  constructor() {
    this.tagsError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }
}
