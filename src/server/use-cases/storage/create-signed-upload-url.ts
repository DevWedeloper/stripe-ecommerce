import { SupabaseClient } from '@supabase/supabase-js';

type CreateSignedUploadUrlInput = {
  storageId: string;
  path: string;
  options?: { upsert: boolean };
};

export const createSignedUploadUrl = (
  supabase: SupabaseClient,
  { storageId, path, options }: CreateSignedUploadUrlInput,
) => supabase.storage.from(storageId).createSignedUploadUrl(path, options);
