import { db } from 'src/db';
import { addresses, AddressInsert } from 'src/db/schema';

export const createAddress = async (
  data: AddressInsert,
): Promise<{
  id: number;
}> => {
  const [address] = await db
    .insert(addresses)
    .values(data)
    .returning({ id: addresses.id });

  return address;
};
