import { getAvatarPath as getAvatarPathFromDb } from 'src/db/data-access/user/get-avatar-path';

export const getAvatarPath = async (userId: string) =>
  await getAvatarPathFromDb(userId);
