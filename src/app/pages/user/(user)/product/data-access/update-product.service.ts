import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  from,
  map,
  mergeMap,
  of,
  share,
  shareReplay,
  Subject,
  switchMap,
  toArray,
} from 'rxjs';
import { fileToPlaceholder } from 'src/app/shared/utils/placeholder';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { environment } from 'src/environments/environment';
import { UpdateProductSchema } from 'src/schemas/product';
import { createClient } from 'src/supabase/browser';
import { TrpcClient } from 'src/trpc-client';
import { deleteFilesFromS3 } from '../../../../../shared/utils/s3';
import { ExistingImageItem, ImageItem, LocalImageItem } from '../types/image';
import { UserProductFormData } from '../utils/form';
import { createName } from '../../../../../shared/utils/name';
import { processImageUploads } from '../utils/rxjs';

type UpdateProductData = {
  modifiedFormData: UserProductFormData;
  modifiedImageItems: ImageItem[];
  imageItemsToUpload: LocalImageItem[];
  imageItemsMarkedForDeletion: ExistingImageItem[];
};

@Injectable()
export class UpdateProductService {
  private _trpc = inject(TrpcClient);
  private supabase = createClient();

  private updateProductTrigger$ = new Subject<UpdateProductData>();

  private updateProduct$ = this.updateProductTrigger$.pipe(
    switchMap(({ modifiedImageItems, ...rest }) =>
      from(modifiedImageItems).pipe(
        mergeMap((item) =>
          item.type === 'local'
            ? from(fileToPlaceholder(item.file)).pipe(
                map((placeholder) => ({
                  ...item,
                  placeholder,
                })),
              )
            : of(item),
        ),
        toArray(),
        map((modifiedImageItems) => ({
          ...rest,
          modifiedImageItems,
        })),
      ),
    ),
    map(
      ({
        modifiedFormData,
        modifiedImageItems,
        imageItemsToUpload,
        ...rest
      }) => ({
        ...rest,
        payload: {
          modified: modifiedFormData,
          modifiedImages: {
            existing: modifiedImageItems
              .filter((image) => image.type === 'existing')
              .map(({ id, isThumbnail, order }) => ({
                id,
                isThumbnail,
                order,
              })),
            added: modifiedImageItems
              .filter((image) => image.type === 'local')
              .map(({ id, placeholder, isThumbnail, order }) => ({
                imagePath: id,
                placeholder,
                isThumbnail,
                order,
              })),
          },
        } as UpdateProductSchema,
        imageItemsToUpload: imageItemsToUpload.map((data) => ({
          ...data,
          name: createName(data.file),
        })),
      }),
    ),
    switchMap((data) =>
      data.imageItemsToUpload.length > 0
        ? processImageUploads(
            data.imageItemsToUpload,
            this._trpc,
            this.supabase,
            environment.productImagesS3Bucket,
          ).pipe(
            map((images) => ({
              ...data,
              payload: {
                ...data.payload,
                modifiedImages: {
                  ...data.payload.modifiedImages,
                  added: images,
                },
              },
            })),
          )
        : of(data),
    ),
    switchMap((data) => {
      const paths = data.imageItemsMarkedForDeletion.map((image) => image.path);

      return paths.length > 0
        ? this.deleteImages(paths).pipe(map(() => data))
        : of(data);
    }),
    materializeAndShare(({ payload }) =>
      this._trpc.products.updateByUserId.mutate(payload),
    ),
  );

  updateProductSuccess$ = this.updateProduct$.pipe(
    successStream(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  updateProductError$ = this.updateProduct$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.updateProductTrigger$,
    success: this.updateProductSuccess$,
    error: this.updateProductError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.updateProductError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  private deleteImages(paths: string[]) {
    return deleteFilesFromS3(
      this.supabase,
      paths,
      environment.productImagesS3Bucket,
    );
  }

  updateProduct(data: UpdateProductData) {
    this.updateProductTrigger$.next(data);
  }
}
