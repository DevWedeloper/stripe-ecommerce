import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge, tap } from 'rxjs';
import { mapProductToFormData } from '../../../../../../utils/product';
import { ExistingImageItem, ImageItem, LocalImageItem } from '../types/image';
import {
  addFiles,
  deleteItem,
  mapImageObjectsToExistingImages,
  setThumbnail,
  sortItems,
} from '../utils/image';
import { UpdateProductService } from './update-product.service';
import { UserProductDetailsService } from './user-product-details.service';

@Injectable()
export class ProductDetailsSyncService {
  private productDetailsService = inject(UserProductDetailsService);
  private updateProductService = inject(UpdateProductService);

  private product$ = merge(
    this.productDetailsService.productSuccess$,
    this.updateProductService.updateProductSuccess$.pipe(
      tap((data) => {
        if (!data) console.warn('No product data received after update.');
      }),
    ),
  );

  product = toSignal(this.product$, { initialValue: null });

  productId = computed(() => this.product()?.id || null);

  originalFormData = computed(() => {
    const product = this.product();
    return product ? mapProductToFormData(product) : null;
  });

  originalImageItems = computed(() => {
    const product = this.product();
    return product && product.imageObjects
      ? mapImageObjectsToExistingImages(product.imageObjects)
      : [];
  });

  private imageItems = linkedSignal<
    ReturnType<typeof this.product>,
    ImageItem[]
  >({
    source: this.product,
    computation: (product) =>
      product && product.imageObjects
        ? mapImageObjectsToExistingImages(product.imageObjects)
        : [],
  });

  activeImageItems = computed(() =>
    this.imageItems()
      .filter(isActiveImage)
      .map((image, index) => ({ ...image, order: index + 1 })),
  );

  imageItemsToUpload = computed(() =>
    this.activeImageItems().filter((image) => image.type === 'local'),
  );

  imageItemsMarkedForDeletion = computed(
    () =>
      this.imageItems().filter(
        (image) => image.type === 'existing' && image.markedForDeletion,
      ) as ExistingImageItem[],
  );

  private selectedFilesError = signal<string | null>(null);

  getImageItems = computed(() => this.imageItems());

  selectedThumbnailId = computed(
    () => this.imageItems().find((item) => item.isThumbnail)?.id || null,
  );
  selectedFilesErrorMessage = computed(() => this.selectedFilesError());

  addSelectedFiles(files: File[]): void {
    addFiles(files, this.imageItems, this.selectedFilesError, isActiveImage);
  }

  toggleDeletion(id: string | number): void {
    const item = this.imageItems().find((image) => image.id === id);
    if (!item) {
      console.warn(`Image with ID "${id}" not found.`);
      return;
    }

    if (item.type === 'local') {
      this.deleteSelectedLocalFile(item);
      return;
    }

    if (item.markedForDeletion) {
      this.unmarkForDeletion(id);
      return;
    }

    this.markForDeletion(id);
  }

  setThumbnail(id: string | number): void {
    setThumbnail(this.imageItems, id);
  }

  sortImageItems(previousIndex: number, currentIndex: number): void {
    sortItems(this.imageItems, previousIndex, currentIndex);
  }

  private deleteSelectedLocalFile(item: LocalImageItem): void {
    deleteItem(this.imageItems, item);
  }

  private markForDeletion(id: string | number): void {
    this.imageItems.update((current) =>
      updateExistingImageDeletionStatus(id, current, true),
    );
  }

  private unmarkForDeletion(id: string | number): void {
    const activeImagesBefore = this.imageItems().filter(isActiveImage).length;

    if (activeImagesBefore + 1 > 10) {
      this.selectedFilesError.set(`You can only have up to 10 active images.`);
      return;
    }

    this.imageItems.update((current) =>
      updateExistingImageDeletionStatus(id, current, false),
    );

    this.selectedFilesError.set(null);
  }
}

const isActiveImage = (image: ImageItem): boolean => {
  return (
    image.type === 'local' ||
    (image.type === 'existing' && !image.markedForDeletion)
  );
};

const updateExistingImageDeletionStatus = (
  id: string | number,
  imageItems: ImageItem[],
  status: boolean,
): ImageItem[] =>
  imageItems.map((image) => {
    if (image.id === id && image.type === 'existing') {
      return { ...image, markedForDeletion: status };
    }
    return image;
  });
