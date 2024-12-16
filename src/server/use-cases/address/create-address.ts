import postgres from 'postgres';
import { findOrCreateAddress } from 'src/db/data-access/address/find-or-create-address';
import { FindOrCreateAddressData } from 'src/db/types';

export const createAddress = async (
  userId: string,
  data: FindOrCreateAddressData,
): Promise<{ error: { message: string } | null }> => {
  try {
    await findOrCreateAddress(userId, data);
  } catch (error) {
    if (error instanceof postgres.PostgresError && error.code === '23505') {
      return {
        error: {
          message:
            'An address with this information already exists for this user.',
        },
      };
    }

    throw error;
  }
  return { error: null };
};
