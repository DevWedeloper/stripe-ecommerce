import { moveItemInArray } from '@angular/cdk/drag-drop';
import { FormBuilder, Validators } from '@angular/forms';
import { isInteger, isPositiveInteger } from 'src/app/shared/validators';
import { UserProductFormSchema, VariationSchema } from 'src/schemas/product';
import { Option } from '../types/variant';
import { itemVariationsMatchVariants } from '../validators/item-variations-match-variants';
import { maxItems } from '../validators/max-items';
import { nonEmptyArray } from '../validators/non-empty-array';
import { uniqueCombination } from '../validators/unique-combination';
import { uniqueValues } from '../validators/unique-values';
import { variationsExistInVariants } from '../validators/variations-exist-in-variants';

type ItemData = {
  id: number | null;
  sku: string;
  stock: number;
  price: number;
  variations: {
    name: string;
    value: string;
    order: number;
  }[];
};

type UserProductData = {
  id: number | null;
  name: string;
  description: string;
  variants: VariationSchema[];
  items: ItemData[];
  categoryId: number;
  tagIds: number[];
};

const createOptionControl = (fb: FormBuilder, option?: Option) =>
  fb.nonNullable.group({
    id: [option?.id ?? null],
    value: [
      option?.value ?? '',
      [Validators.required, Validators.maxLength(256)],
    ],
    order: [option?.order ?? 0],
  });

const createVariantGroup = (fb: FormBuilder, variant?: VariationSchema) => {
  const form = fb.nonNullable.group({
    id: [{ value: variant?.id ?? null, disabled: true }],
    variation: [
      variant?.variation ?? '',
      [Validators.required, Validators.maxLength(256)],
    ],
    options: fb.nonNullable.array(
      (variant ? variant.options : [])
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
        .map((option) => createOptionControl(fb, option)),
      { validators: [uniqueValues('value'), nonEmptyArray] },
    ),
  });

  if (variant) {
    form.disable();
  }

  return form;
};

const createVariationGroup = (
  fb: FormBuilder,
  defaults?: { name?: string; value?: string; order?: number | null },
) => {
  const form = fb.nonNullable.group({
    name: [
      defaults?.name ?? '',
      [Validators.required, Validators.maxLength(256)],
    ],
    value: [
      defaults?.value ?? '',
      [Validators.required, Validators.maxLength(256)],
    ],
    order: [defaults?.order ?? 0],
  });

  if (defaults) {
    form.disable();
  }

  return form;
};

const createItemGroup = (
  fb: FormBuilder,
  item?: ItemData,
  variants?: VariationSchema[],
) =>
  fb.nonNullable.group({
    id: [{ value: item?.id ?? null, disabled: Boolean(variants) }],
    sku: [
      { value: item?.sku ?? '', disabled: Boolean(variants) },
      [Validators.required, Validators.maxLength(256)],
    ],
    stock: [
      item?.stock ?? 0,
      [Validators.required, Validators.min(-1), isInteger],
    ],
    price: [
      item?.price ?? 0,
      [Validators.required, Validators.min(0), isPositiveInteger],
    ],
    variations: fb.nonNullable.array(
      item
        ? item.variations.map((variation) =>
            createVariationGroup(fb, variation),
          )
        : (variants || []).map((variant) =>
            createVariationGroup(fb, { name: variant.variation }),
          ),
      { validators: [uniqueValues('name'), nonEmptyArray] },
    ),
  });

export const initializeUserProductForm = (
  fb: FormBuilder,
  data?: UserProductData,
) => {
  const {
    id = null,
    name = '',
    description = '',
    variants = [],
    items = [],
    categoryId = 0,
    tagIds = [],
  } = data || {};

  return fb.nonNullable.group(
    {
      id: [{ value: id, disabled: true }],
      name: [name, [Validators.required, Validators.maxLength(256)]],
      description: [
        description,
        [Validators.required, Validators.maxLength(256)],
      ],
      variants: fb.nonNullable.array(
        variants.map((variant) => createVariantGroup(fb, variant)),
        {
          validators: [uniqueValues('variation'), nonEmptyArray, maxItems(4)],
        },
      ),
      items: fb.nonNullable.array(
        items.map((item) => createItemGroup(fb, item, variants)),
        {
          validators: [
            uniqueValues('sku'),
            uniqueCombination({
              arrayKey: 'variations',
              combinationKeys: ['name', 'value'],
            }),
            nonEmptyArray,
          ],
        },
      ),
      categoryId: [categoryId, [Validators.required, isPositiveInteger]],
      tagIds: [tagIds, [isPositiveInteger, uniqueValues(), maxItems(10)]],
    },
    {
      validators: [variationsExistInVariants, itemVariationsMatchVariants],
    },
  );
};

export type UserProductForm = ReturnType<typeof initializeUserProductForm>;
export type UserProductFormData = ReturnType<UserProductForm['getRawValue']>;
export type VariantsFormData = UserProductFormData['variants'];
export type ItemsFormData = UserProductFormData['items'];

type EnsureSame<T1, T2> = T1 extends T2
  ? T2 extends T1
    ? true
    : false
  : false;

const typeCheck: EnsureSame<UserProductFormData, UserProductFormSchema> = true;

export const addVariant = (form: UserProductForm, fb: FormBuilder): void =>
  form.controls.variants.push(createVariantGroup(fb));

export const removeVariant = (
  form: UserProductForm,
  variantIndex: number,
): void => form.controls.variants.removeAt(variantIndex);

export const addVariationOption = (
  form: UserProductForm,
  fb: FormBuilder,
  variantIndex: number,
): void => {
  const variantFormArray = form.controls.variants;
  const variantFormGroup = variantFormArray.at(variantIndex);
  const optionsFormArray = variantFormGroup.controls.options;

  optionsFormArray.push(createOptionControl(fb));

  const updatedOptions = optionsFormArray
    .getRawValue()
    .map((option, index) => ({
      ...option,
      order: index + 1,
    }));

  optionsFormArray.patchValue(updatedOptions);
};

export const removeVariationOption = (
  form: UserProductForm,
  variantIndex: number,
  optionIndex: number,
): void => {
  const variantFormArray = form.controls.variants;
  const variantFormGroup = variantFormArray.at(variantIndex);
  const optionsFormArray = variantFormGroup.controls.options;

  optionsFormArray.removeAt(optionIndex);

  const updatedOptions = optionsFormArray
    .getRawValue()
    .map((option, index) => ({
      ...option,
      order: index + 1,
    }));

  optionsFormArray.patchValue(updatedOptions);
};

export const addItem = (
  form: UserProductForm,
  fb: FormBuilder,
  variants: VariationSchema[],
): void => form.controls.items.push(createItemGroup(fb, undefined, variants));

export const removeItem = (form: UserProductForm, itemIndex: number): void =>
  form.controls.items.removeAt(itemIndex);

export const sortVariantOptions = (
  form: UserProductForm,
  variantIndex: number,
  previousIndex: number,
  currentIndex: number,
) => {
  const variantFormArray = form.controls.variants;
  const variantFormGroup = variantFormArray.at(variantIndex);
  const optionsFormArray = variantFormGroup.controls.options;

  moveItemInArray(optionsFormArray.controls, previousIndex, currentIndex);

  const updatedOptions = optionsFormArray.getRawValue().map((data, index) => ({
    ...data,
    order: index + 1,
  }));

  optionsFormArray.patchValue(updatedOptions);
};

export const syncItemVariations = (
  form: UserProductForm,
  fb: FormBuilder,
  variants: VariationSchema[],
): void => {
  const items = form.controls.items;

  items.controls.forEach((itemGroup) => {
    const variationsControl = itemGroup.controls.variations;

    const updatedGroups = variants.map((variant) =>
      createVariationGroup(fb, { name: variant.variation }),
    );

    variationsControl.clear();
    updatedGroups.forEach((v) => variationsControl.push(v));
  });
};
