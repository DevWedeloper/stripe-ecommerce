import { SupabaseClient } from '@supabase/supabase-js';
import { getAvatarPath as getAvatarPathFromDb } from 'src/db/data-access/user/get-avatar-path';
import { updateAvatarPath as updateAvatarPathFromDb } from 'src/db/data-access/user/update-avatar-path';
import { getEnvVar } from 'src/env';
import { AVATAR_SIZES, getAvatarPath } from 'src/utils/image';
import { typedObjectKeys } from 'src/utils/object';

const SUPABASE_AVATARS_S3_BUCKET = getEnvVar('VITE_AVATARS_S3_BUCKET');

export const updateAvatarPath = async (
  supabase: SupabaseClient,
  userId: string,
  avatarPath: string | null,
) => {
  const { avatarPath: currentAvatarPath } = await getAvatarPathFromDb(userId);

  if (currentAvatarPath) {
    const deletePaths = typedObjectKeys(AVATAR_SIZES).map((size) =>
      getAvatarPath(currentAvatarPath, size),
    );

    const { data, error } = await supabase.storage
      .from(SUPABASE_AVATARS_S3_BUCKET)
      .remove(deletePaths);

    if (error) return { data, error };
  }

  const data = await updateAvatarPathFromDb(userId, avatarPath);

  return { data, error: null };
};
