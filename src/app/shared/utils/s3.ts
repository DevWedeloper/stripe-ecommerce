import { SupabaseClient } from '@supabase/supabase-js';
import { from, map } from 'rxjs';
import { FileBase, SignedFile } from '../types/s3';
import { Trpc } from '../types/trpc';

export const createSignedUploadUrl = <T extends FileBase>(
  trpc: Trpc,
  uploadData: T,
  bucket: string,
) =>
  trpc.storage.createSignedUploadUrl
    .mutate({
      storageId: bucket,
      path: uploadData.name,
    })
    .pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(
            `Failed to create signed upload URL for item: ${uploadData.name}`,
          );
        }
        return { ...uploadData, token: data.token };
      }),
    );

export const uploadFileToS3 = <T extends SignedFile>(
  supabase: SupabaseClient,
  uploadData: T,
  bucket: string,
) =>
  from(
    supabase.storage
      .from(bucket)
      .uploadToSignedUrl(uploadData.name, uploadData.token, uploadData.file),
  ).pipe(
    map(({ error }) => {
      if (error) {
        throw new Error(`Failed to upload item: ${uploadData.name}`);
      }
      return { ...uploadData };
    }),
  );

export const deleteFilesFromS3 = (
  supabase: SupabaseClient,
  paths: string[],
  bucket: string,
) =>
  from(supabase.storage.from(bucket).remove(paths)).pipe(
    map(({ data, error }) => {
      if (error) {
        throw new Error(`Failed to delete files: ${error.message}`);
      }
      return data;
    }),
  );
