import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMove, lucideTrash2 } from '@ng-icons/lucide';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import {
  ERROR_MESSAGES,
  VALIDATION_ERROR_MESSAGES,
} from 'src/app/shared/dynamic-form-errors/input-error/validation-error-messages.token';
import { createProvider } from 'src/app/shared/utils/create-provider';
import {
  authInputErrorProvider,
  sharedFormDeps,
} from 'src/app/shared/utils/form';
import { Categories, TagsSelect } from 'src/db/schema';
import { Variant } from '../types/variant';

@Component({
  selector: 'app-user-product-form',
  imports: [
    ...sharedFormDeps,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
    BrnSelectImports,
    HlmSelectImports,
  ],
  providers: [
    authInputErrorProvider,
    createProvider(VALIDATION_ERROR_MESSAGES, {
      useValue: {
        ...ERROR_MESSAGES,
        notAFormArray: () => 'Not a form array',
        duplicateValues: () => 'Duplicate values',
        requiredArray: () => 'Required array',
        duplicateCombination: () => 'Duplicate combination',
        invalidVariation: () => 'Invalid variation',
        hasMissingVariants: () => 'Missing variants',
        maxItems: ({ maxItems, actual }) => `Max ${maxItems} items (${actual})`,
      },
    }),
    provideIcons({ lucideTrash2, lucideMove }),
  ],
  template: `
    <form
      [formGroup]="form()"
      (ngSubmit)="submitChange.emit()"
      class="flex flex-col gap-4"
    >
      <hlm-form-field>
        <label hlmLabel for="name">Name</label>
        <input
          hlmInput
          formControlName="name"
          id="name"
          type="text"
          placeholder="Name"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-form-field>
        <label hlmLabel for="description">Description</label>
        <input
          hlmInput
          formControlName="description"
          id="description"
          type="text"
          placeholder="Description"
          class="w-full"
        />
      </hlm-form-field>

      <fieldset
        formArrayName="variants"
        class="flex flex-col gap-4 rounded-md border border-border p-4"
      >
        <legend class="font-bold">Variants</legend>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          @for (variant of variants.controls; track {}; let i = $index) {
            <div>
              <div [formGroupName]="i" class="relative">
                <hlm-form-field>
                  <label hlmLabel for="variant-{{ i }}">
                    Variation {{ i + 1 }}
                  </label>
                  <input
                    hlmInput
                    formControlName="variation"
                    id="variant-{{ i }}"
                    type="text"
                    class="w-full"
                  />
                </hlm-form-field>

                <fieldset
                  cdkDropList
                  formArrayName="options"
                  class="boundary list flex flex-col gap-4 rounded-md border border-border p-4"
                  (cdkDropListDropped)="
                    sort.emit({
                      variationIndex: i,
                      previousIndex: $event.previousIndex,
                      currentIndex: $event.currentIndex,
                    })
                  "
                >
                  <legend class="font-bold">Options</legend>

                  @for (
                    option of getVariant(i).controls;
                    track {};
                    let j = $index
                  ) {
                    <div
                      cdkDrag
                      cdkDragBoundary=".boundary"
                      class="box relative bg-background"
                      [formGroupName]="j"
                    >
                      <hlm-form-field>
                        <label hlmLabel for="option-{{ i }}-{{ j }}">
                          Option {{ j + 1 }}
                        </label>
                        <input
                          hlmInput
                          formControlName="value"
                          id="option-{{ i }}-{{ j }}"
                          type="text"
                          class="w-full"
                        />
                      </hlm-form-field>

                      <div
                        class="absolute right-0 top-0 flex items-center gap-2"
                      >
                        <ng-icon
                          cdkDragHandle
                          hlm
                          size="sm"
                          name="lucideMove"
                          class="cursor-move"
                        />

                        <button
                          hlmBtn
                          type="button"
                          size="icon"
                          variant="destructive"
                          (click)="
                            removeVariationOption.emit({
                              variantIndex: i,
                              optionIndex: j,
                            })
                          "
                          [disabled]="option.status === 'DISABLED'"
                          class="h-6 w-6"
                        >
                          <ng-icon hlm size="xs" name="lucideTrash2" />
                        </button>
                      </div>
                    </div>
                  }

                  <button
                    hlmBtn
                    type="button"
                    (click)="addVariationOption.emit(i)"
                    class="mx-auto w-fit"
                  >
                    Add Option
                  </button>
                </fieldset>

                <button
                  hlmBtn
                  type="button"
                  size="icon"
                  variant="destructive"
                  (click)="removeVariation.emit(i)"
                  [disabled]="disableButton()"
                  class="absolute right-0 top-0 h-6 w-6"
                >
                  <ng-icon hlm size="xs" name="lucideTrash2" />
                </button>
              </div>
            </div>
          }
        </div>

        <button
          hlmBtn
          type="button"
          (click)="addVariation.emit()"
          [disabled]="disableButton()"
          class="mx-auto w-fit"
        >
          Add Variant
        </button>
      </fieldset>

      <fieldset
        formArrayName="items"
        class="flex flex-col gap-4 rounded-md border border-border p-4"
      >
        <legend class="font-bold">Items</legend>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          @for (item of items.controls; track {}; let i = $index) {
            <fieldset
              class="flex flex-col gap-4 rounded-md border border-border p-4"
            >
              <legend class="font-bold">Item {{ i + 1 }}</legend>

              <div [formGroupName]="i" class="relative">
                <hlm-form-field>
                  <label hlmLabel for="sku-{{ i }}">SKU</label>
                  <input
                    hlmInput
                    formControlName="sku"
                    id="sku-{{ i }}"
                    type="text"
                    class="w-full"
                  />
                </hlm-form-field>

                <hlm-form-field>
                  <label hlmLabel for="stock-{{ i }}">Stock</label>
                  <input
                    hlmInput
                    formControlName="stock"
                    id="stock-{{ i }}"
                    type="number"
                    step="1"
                    class="w-full"
                  />
                </hlm-form-field>

                <hlm-form-field>
                  <label hlmLabel for="price-{{ i }}">Price</label>
                  <input
                    hlmInput
                    formControlName="price"
                    id="price-{{ i }}"
                    type="number"
                    step="1"
                    class="w-full"
                  />
                </hlm-form-field>

                <fieldset
                  formArrayName="variations"
                  class="flex flex-col gap-4 rounded-md border border-border p-4"
                >
                  <legend class="font-bold">Variation</legend>

                  @for (
                    variation of getVariation(i).controls;
                    track {};
                    let j = $index
                  ) {
                    <div [formGroupName]="j">
                      <hlm-form-field class="flex flex-col">
                        <label
                          hlmLabel
                          for="{{ getGlobalVariant(j).variation }} {{ j }}"
                        >
                          {{ getGlobalVariant(j).variation }}
                        </label>
                        <brn-select
                          formControlName="value"
                          id="variationValue"
                          [placeholder]="getGlobalVariant(j).variation"
                        >
                          <hlm-select-trigger class="w-full">
                            <hlm-select-value />
                          </hlm-select-trigger>
                          <hlm-select-content>
                            @for (
                              option of getGlobalVariant(j).options;
                              track option.id
                            ) {
                              <hlm-option [value]="option.value">
                                {{ option.value }}
                              </hlm-option>
                            }
                          </hlm-select-content>
                        </brn-select>
                      </hlm-form-field>
                    </div>
                  }
                </fieldset>

                <button
                  hlmBtn
                  type="button"
                  size="icon"
                  variant="destructive"
                  (click)="removeItem.emit(i)"
                  [disabled]="skuDisabled(i)"
                  class="absolute right-0 top-0 h-6 w-6"
                >
                  <ng-icon hlm size="xs" name="lucideTrash2" />
                </button>
              </div>
            </fieldset>
          }
        </div>

        <button
          hlmBtn
          type="button"
          (click)="addItem.emit()"
          class="mx-auto w-fit"
        >
          Add Item
        </button>
      </fieldset>

      <div>
        <ng-content select="[productImages]" />
      </div>

      <hlm-form-field class="flex flex-col">
        <label hlmLabel for="category">Category</label>
        <brn-select
          formControlName="categoryId"
          id="category"
          placeholder="Select a category"
        >
          <hlm-select-trigger class="w-full">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content>
            @for (category of categories(); track category.id) {
              <hlm-option [value]="category.id">{{ category.name }}</hlm-option>
            }
          </hlm-select-content>
        </brn-select>
      </hlm-form-field>

      <hlm-form-field class="flex flex-col">
        <label hlmLabel for="tagIds">Tags</label>
        <brn-select
          formControlName="tagIds"
          id="tagIds"
          placeholder="Select some tags"
          [multiple]="true"
        >
          <hlm-select-trigger class="w-full">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content>
            @for (tag of tags(); track tag.id) {
              <hlm-option [value]="tag.id">{{ tag.name }}</hlm-option>
            }
          </hlm-select-content>
        </brn-select>
      </hlm-form-field>

      <button
        hlmBtnWithLoading
        [disabled]="form().invalid || isLoading() || disable()"
        class="w-full"
        [isLoading]="isLoading()"
      >
        Submit
      </button>
    </form>
  `,
  styles: `
    .cdk-drag-preview {
      border: none;
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow:
        0 5px 5px -3px rgba(0, 0, 0, 0.2),
        0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .list.cdk-drop-list-dragging .box:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProductFormComponent {
  form = input.required<FormGroup>();
  variations = input.required<Variant[]>();
  categories = input.required<Categories[]>();
  tags = input.required<TagsSelect[]>();
  isLoading = input.required<boolean>();
  disable = input.required<boolean>();
  disableButton = input<boolean>(false);
  addVariation = output<void>();
  removeVariation = output<number>();
  addVariationOption = output<number>();
  removeVariationOption = output<{
    variantIndex: number;
    optionIndex: number;
  }>();
  addItem = output<void>();
  removeItem = output<number>();
  sort = output<{
    variationIndex: number;
    previousIndex: number;
    currentIndex: number;
  }>();
  submitChange = output<void>();

  formDir = viewChild.required(FormGroupDirective);

  protected get variants() {
    return this.form().get('variants') as FormArray;
  }

  protected getVariant(variantIndex: number) {
    const selectedVariant = this.variants.at(variantIndex) as FormGroup;
    const optionsArray = selectedVariant.controls['options'] as FormArray;

    return optionsArray;
  }

  protected get items() {
    return this.form().get('items') as FormArray;
  }

  protected getVariation(variationIndex: number) {
    const selectedVariation = this.items.at(variationIndex) as FormGroup;
    const variationsArray = selectedVariation.controls[
      'variations'
    ] as FormArray;

    return variationsArray;
  }

  protected getGlobalVariant(index: number): Variant {
    return this.variations()[index];
  }

  protected skuDisabled(itemIndex: number) {
    return this.items.at(itemIndex).get('sku')?.status === 'DISABLED';
  }
}
