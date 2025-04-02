import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { HlmScrollAreaDirective } from '@spartan-ng/ui-scrollarea-helm';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { filter } from 'rxjs';
import { LeafCategoriesService } from 'src/app/shared/data-access/leaf-categories.service';
import { TagsService } from 'src/app/shared/data-access/tags.service';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { CreateProductService } from '../data-access/create-product.service';
import { PreviewImagesComponent } from '../ui/preview-images.component';
import { ProductImagesComponent } from '../ui/product-images.component';
import { UserProductFormComponent } from '../ui/user-product-form.component';
import {
  addItem,
  addVariant,
  addVariationOption,
  initializeUserProductForm,
  removeItem,
  removeVariant,
  removeVariationOption,
  sortVariantOptions,
  syncItemVariations,
} from '../utils/form';
import { extractVariantsWithIds, mapToVariants } from '../utils/rxjs';

@Component({
  selector: 'app-create-product',
  imports: [
    UserProductFormComponent,
    ProductImagesComponent,
    PreviewImagesComponent,
    NgScrollbarModule,
    HlmScrollAreaDirective,
  ],
  template: `
    <ng-scrollbar hlm visibility="hover" class="h-[calc(100vh-6rem)] w-[576px]">
      <app-user-product-form
        [form]="form"
        [variations]="variations()"
        [categories]="leafCategories()"
        [tags]="tags()"
        [isLoading]="isLoading()"
        [disable]="disable()"
        (addVariation)="addVariant()"
        (removeVariation)="removeVariant($event)"
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
        (submitChange)="createProduct()"
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
    </ng-scrollbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private createProductService = inject(CreateProductService);
  private leafCategoriesService = inject(LeafCategoriesService);
  private tagsService = inject(TagsService);

  private success$ = this.createProductService.createProductSuccess$;
  private error$ = this.createProductService.createProductError$;

  protected getImageItems = this.createProductService.getImageItems;
  protected selectedThumbnailId = this.createProductService.selectedThumbnailId;
  protected selectedFilesErrorMessage =
    this.createProductService.selectedFilesErrorMessage;

  protected isLoading = this.createProductService.isLoading;

  protected leafCategories = this.leafCategoriesService.leafCategories;
  protected tags = this.tagsService.tags;

  private createProductForm = viewChild.required(UserProductFormComponent);

  protected form = initializeUserProductForm(this.fb);

  protected variations = toSignal(
    extractVariantsWithIds(this.form).pipe(mapToVariants()),
    { initialValue: [] },
  );

  protected variantsWithIds = toSignal(extractVariantsWithIds(this.form), {
    initialValue: [],
  });

  private syncItemVariations = effect(() =>
    syncItemVariations(this.form, this.fb, this.variantsWithIds()),
  );

  private disable$ = toggleDisableStream({
    enable: this.form.events.pipe(
      filter((event) => event instanceof ValueChangeEvent),
    ),
    disable: this.error$,
  });

  private disableTemporarily = toSignal(this.disable$, {
    initialValue: false,
  });

  protected disable = computed(
    () => !!this.selectedFilesErrorMessage() || this.disableTemporarily(),
  );

  constructor() {
    this.success$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.createProductForm().formDir().resetForm();
      this.createProductService.clearSelectedFiles();
    });
  }

  ngOnDestroy(): void {
    this.createProductService.clearSelectedFiles();
  }

  protected createProduct(): void {
    this.createProductService.createProduct(this.form.getRawValue());
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    this.createProductService.addSelectedFiles(Array.from(input.files));
    input.value = '';
  }

  protected setThumbnail(id: string | number): void {
    this.createProductService.setThumbnail(id);
  }

  protected sortImageItems(previousIndex: number, currentIndex: number): void {
    this.createProductService.sortImageItems(previousIndex, currentIndex);
  }

  protected deleteImageItem(id: string | number): void {
    this.createProductService.deleteSelectedLocalFile(id);
  }

  protected addVariant = () => addVariant(this.form, this.fb);

  protected removeVariant = (variantIndex: number) =>
    removeVariant(this.form, variantIndex);

  protected addVariationOption = (variantIndex: number) =>
    addVariationOption(this.form, this.fb, variantIndex);

  protected removeVariationOption = (
    variantIndex: number,
    optionIndex: number,
  ) => removeVariationOption(this.form, variantIndex, optionIndex);

  protected addItem = () => addItem(this.form, this.fb, this.variantsWithIds());

  protected removeItem = (itemIndex: number) =>
    removeItem(this.form, itemIndex);

  protected sortVariationOptions = (
    variantIndex: number,
    previousIndex: number,
    currentIndex: number,
  ) => sortVariantOptions(this.form, variantIndex, previousIndex, currentIndex);
}
