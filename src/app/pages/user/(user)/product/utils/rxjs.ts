import { SupabaseClient } from '@supabase/supabase-js';
import { from, map, mergeMap, Observable, startWith, toArray } from 'rxjs';
import { FileBase } from 'src/app/shared/types/s3';
import { Trpc } from 'src/app/shared/types/trpc';
import { fileToPlaceholder } from 'src/app/shared/utils/placeholder';
import { createSignedUploadUrl, uploadFileToS3 } from 'src/app/shared/utils/s3';
import { VariationSchema } from 'src/schemas/product';
import { LocalImageItem } from '../types/image';
import { Variant } from '../types/variant';
import { UserProductForm } from './form';

export const extractVariantsWithIds = (
  form: UserProductForm,
): Observable<VariationSchema[]> =>
  form.valueChanges.pipe(
    startWith(form.getRawValue()),
    map(() => form.getRawValue()),
    map(({ variants }) => variants),
  );

export const mapToVariants = () =>
  map((variants: VariationSchema[]): Variant[] =>
    variants.map((variant) => ({
      variation: variant.variation,
      options: variant.options.map((opt) => ({
        value: opt.value,
        id: opt.id ?? `${Date.now()}-${Math.random()}`,
      })),
    })),
  );

export const processImageUploads = (
  images: (LocalImageItem & FileBase)[],
  trpc: Trpc,
  supabase: SupabaseClient,
  bucket: string,
) =>
  from(images).pipe(
    mergeMap(({ file, ...rest }) =>
      from(fileToPlaceholder(file)).pipe(
        map((placeholder) => ({ ...rest, file, placeholder })),
      ),
    ),
    mergeMap((image) => createSignedUploadUrl(trpc, image, bucket)),
    mergeMap((image) => uploadFileToS3(supabase, image, bucket)),
    map((image) => ({
      imagePath: image.name,
      placeholder: image.placeholder,
      isThumbnail: image.isThumbnail || false,
      order: image.order,
    })),
    toArray(),
  );
