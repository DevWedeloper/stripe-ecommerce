import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { users } from 'src/db/schema';

export const updateAvatarPath = async (
  userId: string,
  avatarPath: string | null,
) => {
  const [result] = await db
    .update(users)
    .set({ avatarPath })
    .where(eq(users.id, userId))
    .returning({ avatarPath: users.avatarPath });

  return result;
};
