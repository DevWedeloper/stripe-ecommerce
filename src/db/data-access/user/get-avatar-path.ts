import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { users } from 'src/db/schema';

export const getAvatarPath = async (userId: string) => {
  const [result] = await db
    .select({ avatarPath: users.avatarPath })
    .from(users)
    .where(eq(users.id, userId));

  return result;
};
