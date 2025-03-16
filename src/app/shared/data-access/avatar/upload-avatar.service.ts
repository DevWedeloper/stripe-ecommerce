import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import pica from 'pica';
import {
  filter,
  from,
  map,
  merge,
  mergeMap,
  share,
  Subject,
  switchMap,
  toArray,
} from 'rxjs';
import { loadImage } from 'src/app/shared/utils/image';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { createSignedUploadUrl, uploadFileToS3 } from 'src/app/shared/utils/s3';
import { showError } from 'src/app/shared/utils/toast';
import { environment } from 'src/environments/environment';
import { createClient } from 'src/supabase/browser';
import { TrpcClient } from 'src/trpc-client';
import { AVATAR_SIZES, getAvatarPath } from 'src/utils/image';
import { typedObjectEntries, typedObjectFromEntries } from 'src/utils/object';
import { CropperResult } from '../../types/cropper';
import { createName } from '../../utils/name';

@Injectable({
  providedIn: 'root',
})
export class UploadAvatarService {
  private _trpc = inject(TrpcClient);
  private supabase = createClient();

  private updateAvatarTrigger$ = new Subject<CropperResult>();

  private updateAvatar$ = this.updateAvatarTrigger$.pipe(
    switchMap(({ blob, imageUrl }) =>
      from(generateImageVariants(imageUrl)).pipe(
        map((variants) => {
          const baseName = createName(blob);

          return {
            images: typedObjectEntries(variants).map(([size, file]) => ({
              file,
              name: getAvatarPath(baseName, size),
            })),
            name: baseName,
          };
        }),
      ),
    ),
    switchMap((data) =>
      from(data.images).pipe(
        mergeMap((data) =>
          createSignedUploadUrl(this._trpc, data, environment.avatarsS3Bucket),
        ),
        mergeMap((data) =>
          uploadFileToS3(this.supabase, data, environment.avatarsS3Bucket),
        ),
        toArray(),
        map(() => data.name),
      ),
    ),
    materializeAndShare((name) =>
      this._trpc.users.updateAvatarPath.mutate(name),
    ),
  );

  private updateAvatarSuccess$ = this.updateAvatar$.pipe(
    successStream(),
    share(),
  );

  updateAvatarSuccessWithData$ = this.updateAvatarSuccess$.pipe(
    filter((data) => data.error === null),
    map((data) => data.data),
    share(),
  );

  private updateAvatarSuccessWithError$ = this.updateAvatarSuccess$.pipe(
    filter((data) => data.error !== null),
    map((data) => data.error),
  );

  private updateAvatarError$ = this.updateAvatar$.pipe(errorStream());

  private error$ = merge(
    this.updateAvatarSuccessWithError$,
    this.updateAvatarError$,
  ).pipe(share());

  private status$ = statusStream({
    loading: this.updateAvatarTrigger$,
    success: this.updateAvatarSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  updateAvatar(data: CropperResult): void {
    this.updateAvatarTrigger$.next(data);
  }
}

const generateImageVariants = async (imageUrl: string) => {
  const picaInstance = pica();
  const img = await loadImage(imageUrl);

  const entries = await Promise.all(
    typedObjectEntries(AVATAR_SIZES).map(async ([size, { width, height }]) => {
      const canvas = Object.assign(document.createElement('canvas'), {
        width,
        height,
      });
      await picaInstance.resize(img, canvas);
      return [size, await canvasToBlob(canvas)] as [typeof size, Blob];
    }),
  );

  const variants = typedObjectFromEntries(entries);

  return variants;
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), 'image/png'),
  );
