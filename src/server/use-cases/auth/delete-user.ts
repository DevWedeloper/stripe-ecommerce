import { SupabaseClient } from '@supabase/supabase-js';
import { deleteUser as deleteUserFromDb } from 'src/db/data-access/user/delete-user';
import { getAvatarPath as getAvatarPathFromDb } from 'src/db/data-access/user/get-avatar-path';
import { getEnvVar } from 'src/env';
import { AVATAR_SIZES, getAvatarPath } from 'src/utils/image';
import { typedObjectKeys } from 'src/utils/object';

const SUPABASE_AVATARS_S3_BUCKET = getEnvVar('VITE_AVATARS_S3_BUCKET');

export const deleteUser = async (
  supabase: SupabaseClient,
  { id }: { id: string },
) => {
  const { avatarPath } = await getAvatarPathFromDb(id);

  if (avatarPath) {
    const deletePaths = typedObjectKeys(AVATAR_SIZES).map((size) =>
      getAvatarPath(avatarPath, size),
    );

    const { error } = await supabase.storage
      .from(SUPABASE_AVATARS_S3_BUCKET)
      .remove(deletePaths);

    if (error) console.error('Failed to delete avatar images:', error);
  }

  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    console.error('Failed to delete user:', error);
    return { error };
  }

  await deleteUserFromDb(id);

  return { error: null };
};
