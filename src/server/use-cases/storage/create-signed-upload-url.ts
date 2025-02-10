import { SupabaseClient } from '@supabase/supabase-js';

export const createSignedUploadUrl = (
  supabase: SupabaseClient,
  storageId: string,
  path: string,
  options?: { upsert: boolean },
) => supabase.storage.from(storageId).createSignedUploadUrl(path, options);
