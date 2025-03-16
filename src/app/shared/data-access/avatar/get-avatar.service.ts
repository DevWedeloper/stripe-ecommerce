import { computed, effect, inject, Injectable } from '@angular/core';
import {
  pendingUntilEvent,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { materialize, merge, of, share, switchMap } from 'rxjs';
import { getS3ImageUrl } from 'src/app/shared/utils/image-object';
import { errorStream, successStream } from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { environment } from 'src/environments/environment';
import { TrpcClient } from 'src/trpc-client';
import { getAvatarPath } from 'src/utils/image';
import { AuthService } from '../auth.service';
import { DeleteAvatarService } from './delete-avatar.service';
import { UploadAvatarService } from './upload-avatar.service';

@Injectable({
  providedIn: 'root',
})
export class GetAvatarService {
  private _trpc = inject(TrpcClient);
  private authService = inject(AuthService);
  private updateAvatarService = inject(UploadAvatarService);
  private deleteAvatarService = inject(DeleteAvatarService);

  private getAvatar$ = merge(
    this.authService.user$.pipe(
      switchMap((user) =>
        user ? this._trpc.users.getAvatarPath.query() : of(null),
      ),
    ),
    this.updateAvatarService.updateAvatarSuccessWithData$,
    this.deleteAvatarService.deleteAvatarSuccessWithData$,
  ).pipe(pendingUntilEvent(), materialize(), share());

  private getAvatarSuccess$ = this.getAvatar$.pipe(successStream());

  private getAvatarError$ = this.getAvatar$.pipe(errorStream());

  private avatar = toSignal(this.getAvatarSuccess$, { initialValue: null });

  avatarPath = computed(() => {
    const avatarPath = this.avatar()?.avatarPath;

    return avatarPath
      ? getS3ImageUrl({
          path: getAvatarPath(avatarPath, 'original'),
          bucketName: environment.avatarsS3Bucket,
        })
      : null;
  });

  avatarIconPath = computed(() => {
    const avatarPath = this.avatar()?.avatarPath;

    return avatarPath
      ? getS3ImageUrl({
          path: getAvatarPath(avatarPath, 'icon'),
          bucketName: environment.avatarsS3Bucket,
        })
      : null;
  });

  constructor() {
    this.getAvatarError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }
}
