import { RouteMeta } from '@analogjs/router';
import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { isEqual } from 'lodash-es';
import { combineLatest, filter, map, startWith, switchMap } from 'rxjs';
import { LeafCategoriesService } from 'src/app/shared/data-access/leaf-categories.service';
import { TagsService } from 'src/app/shared/data-access/tags.service';
import { EmptyProductDetailsComponent } from 'src/app/shared/ui/fallback/empty-product-details.component';
import { GoBackButtonComponent } from 'src/app/shared/ui/go-back-button.component';
import { metaWith } from 'src/app/shared/utils/meta';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { ProductDetailsSyncService } from './data-access/product-details-sync.service';
import { UpdateProductService } from './data-access/update-product.service';
import { UserProductDetailsService } from './data-access/user-product-details.service';
import { DeleteProductComponent } from './features/delete-product.component';
import { PreviewImagesComponent } from './ui/preview-images.component';
import { ProductImagesComponent } from './ui/product-images.component';
import { UserProductFormComponent } from './ui/user-product-form.component';
import {
  addItem,
  addVariationOption,
  initializeUserProductForm,
  removeItem,
  removeVariationOption,
  sortVariantOptions,
} from './utils/form';
import { extractVariantsWithIds, mapToVariants } from './utils/rxjs';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Product Management',
    'Edit or remove your product details.',
  ),
  title: 'Stripe Ecommerce | Product Management',
};

@Component({
  selector: 'app-user-product-detail',
  standalone: true,
  imports: [
    GoBackButtonComponent,
    UserProductFormComponent,
    ProductImagesComponent,
    PreviewImagesComponent,
    EmptyProductDetailsComponent,
    DeleteProductComponent,
  ],
  providers: [
    UserProductDetailsService,
    UpdateProductService,
    ProductDetailsSyncService,
  ],
  template: `
    <app-go-back-button path="/user/product" text="Go back" />
    @if (!isInitialLoading()) {
      @if (initialProduct()) {
        <app-user-product-form
          [form]="form()"
          [variations]="variations()"
          [categories]="leafCategories()"
          [tags]="tags()"
          [isLoading]="isLoading()"
          [disable]="disable() || isStateUnmodified()"
          [disableButton]="true"
          (addVariationOption)="addVariationOption($event)"
          (removeVariationOption)="
            removeVariationOption($event.variantIndex, $event.optionIndex)
          "
          (addItem)="addItem()"
          (removeItem)="removeItem($event)"
          (sort)="
            sortVariationOptions(
              $event.variationIndex,
              $event.previousIndex,
              $event.currentIndex
            )
          "
          (submitChange)="updateProduct()"
          class="block p-1"
        >
          <app-product-images
            productImages
            [errorMessage]="selectedFilesErrorMessage()"
            (filesSelected)="onFileSelected($event)"
          >
            @if (getImageItems().length) {
              <app-preview-images
                class="mt-4"
                [imageItems]="getImageItems()"
                [selectedThumbnailId]="selectedThumbnailId()"
                (selectedImageChange)="setThumbnail($event)"
                (removeImageItem)="deleteImageItem($event)"
                (sorted)="
                  sortImageItems($event.previousIndex, $event.currentIndex)
                "
              />
            }
          </app-product-images>
        </app-user-product-form>

        @if (productId()) {
          <app-delete-product [productId]="productId()!" />
        }
      } @else {
        <div class="flex items-center justify-center">
          <app-empty-product-details />
        </div>
      }
    }
  `,
})
export default class UserProductDetailPageComponent {
  private fb = inject(FormBuilder);
  private productDetailsService = inject(UserProductDetailsService);
  private updateProductService = inject(UpdateProductService);
  private productDetailsSyncService = inject(ProductDetailsSyncService);
  private leafCategoriesService = inject(LeafCategoriesService);
  private tagsService = inject(TagsService);

  private error$ = this.updateProductService.updateProductError$;

  protected initialProduct = this.productDetailsService.product;

  protected productId = this.productDetailsSyncService.productId;
  protected getImageItems = this.productDetailsSyncService.getImageItems;
  protected selectedThumbnailId =
    this.productDetailsSyncService.selectedThumbnailId;
  protected selectedFilesErrorMessage =
    this.productDetailsSyncService.selectedFilesErrorMessage;

  protected isInitialLoading = this.productDetailsService.isInitialLoading;
  protected isLoading = this.updateProductService.isLoading;

  protected leafCategories = this.leafCategoriesService.leafCategories;
  protected tags = this.tagsService.tags;

  private originalFormData = this.productDetailsSyncService.originalFormData;

  protected form = computed(() => {
    const data = this.productDetailsService.initialFormData();

    if (!data) return initializeUserProductForm(this.fb);

    return initializeUserProductForm(this.fb, data);
  });

  private form$ = toObservable(this.form);

  protected variations = toSignal(
    this.form$.pipe(
      switchMap((data) => extractVariantsWithIds(data).pipe(mapToVariants())),
    ),
    { initialValue: [] },
  );

  protected variantsWithIds = toSignal(
    this.form$.pipe(switchMap((data) => extractVariantsWithIds(data))),
    { initialValue: [] },
  );

  private originalFormData$ = toObservable(this.originalFormData);

  private isFormDataUnmodified = toSignal(
    combineLatest([
      this.originalFormData$.pipe(
        map((data) =>
          data
            ? {
                ...data,
                tagIds: [...(data.tagIds ?? [])].sort((a, b) => a - b),
              }
            : data,
        ),
      ),
      this.form$.pipe(
        switchMap((data) =>
          data.valueChanges.pipe(
            startWith(data.getRawValue()),
            map(() => {
              const raw = data.getRawValue();
              return {
                ...raw,
                tagIds: [...raw.tagIds ?? []].sort((a, b) => a - b),
              };
            }),
          ),
        ),
      ),
    ]).pipe(
      map(([initialData, modifiedData]) => isEqual(initialData, modifiedData)),
    ),
    {
      initialValue: true,
    },
  );

  private isImageItemsUnmodified = computed(() =>
    isEqual(
      this.productDetailsSyncService.originalImageItems(),
      this.getImageItems(),
    ),
  );

  protected isStateUnmodified = computed(
    () => this.isFormDataUnmodified() && this.isImageItemsUnmodified(),
  );

  protected disable = toSignal(
    toggleDisableStream({
      enable: this.form().events.pipe(
        filter((event) => event instanceof ValueChangeEvent),
      ),
      disable: this.error$,
    }),
    {
      initialValue: false,
    },
  );

  protected updateProduct(): void {
    this.updateProductService.updateProduct({
      modifiedFormData: this.form().getRawValue(),
      modifiedImageItems: this.productDetailsSyncService.activeImageItems(),
      imageItemsToUpload: this.productDetailsSyncService.imageItemsToUpload(),
      imageItemsMarkedForDeletion:
        this.productDetailsSyncService.imageItemsMarkedForDeletion(),
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    this.productDetailsSyncService.addSelectedFiles(Array.from(input.files));
    input.value = '';
  }

  protected setThumbnail(id: string | number): void {
    this.productDetailsSyncService.setThumbnail(id);
  }

  protected sortImageItems(previousIndex: number, currentIndex: number): void {
    this.productDetailsSyncService.sortImageItems(previousIndex, currentIndex);
  }

  protected deleteImageItem(id: string | number): void {
    this.productDetailsSyncService.toggleDeletion(id);
  }

  protected addVariationOption = (variantIndex: number) =>
    addVariationOption(this.form(), this.fb, variantIndex);

  protected removeVariationOption = (
    variantIndex: number,
    optionIndex: number,
  ) => removeVariationOption(this.form(), variantIndex, optionIndex);

  protected addItem = () =>
    addItem(this.form(), this.fb, this.variantsWithIds());

  protected removeItem = (itemIndex: number) =>
    removeItem(this.form(), itemIndex);

  protected sortVariationOptions = (
    variantIndex: number,
    previousIndex: number,
    currentIndex: number,
  ) =>
    sortVariantOptions(this.form(), variantIndex, previousIndex, currentIndex);
}
