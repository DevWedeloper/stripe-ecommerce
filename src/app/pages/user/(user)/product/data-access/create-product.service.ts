import { computed, inject, Injectable, signal } from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { map, share, Subject, switchMap, withLatestFrom } from 'rxjs';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { environment } from 'src/environments/environment';
import { createClient } from 'src/supabase/browser';
import { TrpcClient } from 'src/trpc-client';
import { LocalImageItem } from '../types/image';
import { UserProductFormData } from '../utils/form';
import { addFiles, deleteItem, setThumbnail, sortItems } from '../utils/image';
import { createName } from '../../../../../shared/utils/name';
import { processImageUploads } from '../utils/rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreateProductService {
  private _trpc = inject(TrpcClient);
  private supabase = createClient();

  private imageItems = signal<LocalImageItem[]>([]);
  private selectedFilesError = signal<string | null>(null);

  private createProductTrigger$ = new Subject<UserProductFormData>();

  private createProduct$ = this.createProductTrigger$.pipe(
    withLatestFrom(toObservable(this.imageItems)),
    map(([productDetails, imageItems]) => {
      const images = imageItems.map((img) => ({
        ...img,
        name: createName(img.file),
      }));

      return {
        productDetails,
        images,
      };
    }),
    switchMap((data) =>
      processImageUploads(
        data.images,
        this._trpc,
        this.supabase,
        environment.productImagesS3Bucket,
      ).pipe(
        map((images) => ({
          ...data,
          images,
        })),
      ),
    ),
    materializeAndShare((data) => this._trpc.products.create.mutate(data)),
  );

  createProductSuccess$ = this.createProduct$.pipe(successStream(), share());

  createProductError$ = this.createProduct$.pipe(errorStream(), share());

  private status$ = statusStream({
    loading: this.createProductTrigger$,
    success: this.createProductSuccess$,
    error: this.createProductError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  getImageItems = computed(() => this.imageItems());
  selectedThumbnailId = computed(
    () => this.imageItems().find((item) => item.isThumbnail)?.id || null,
  );
  selectedFilesErrorMessage = computed(() => this.selectedFilesError());

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.createProductError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  createProduct(data: UserProductFormData): void {
    this.createProductTrigger$.next(data);
  }

  addSelectedFiles(files: File[]): void {
    addFiles(files, this.imageItems, this.selectedFilesError);
  }

  deleteSelectedLocalFile(id: string | number): void {
    const item = this.imageItems().find((image) => image.id === id);
    if (!item) {
      console.warn(`Image with ID "${id}" not found.`);
      return;
    }

    deleteItem(this.imageItems, item);
  }

  clearSelectedFiles(): void {
    this.imageItems.set([]);
  }

  setThumbnail(id: string | number): void {
    setThumbnail(this.imageItems, id);
  }

  sortImageItems(previousIndex: number, currentIndex: number): void {
    sortItems(this.imageItems, previousIndex, currentIndex);
  }
}
