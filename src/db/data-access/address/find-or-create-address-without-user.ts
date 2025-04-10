import { and, eq, sql } from 'drizzle-orm';
import { union } from 'drizzle-orm/pg-core';
import { db } from 'src/db';
import { addresses, receivers } from 'src/db/schema';
import { CreateAddressSchema } from 'src/schemas/address';

type AddressAndReceiverResult = {
  addressId: number;
  receiverId: number;
};

export const findOrCreateAddressWithoutUser = async (
  data: CreateAddressSchema,
): Promise<AddressAndReceiverResult> => {
  const createdAddressQuery = db
    .$with('created_address_query')
    .as(
      db
        .insert(addresses)
        .values(data)
        .onConflictDoNothing()
        .returning({ id: addresses.id }),
    );

  const addressIdQuery = db.$with('address_id_query').as(
    union(
      db.select({ id: createdAddressQuery.id }).from(createdAddressQuery),
      db
        .select({
          id: addresses.id,
        })
        .from(addresses)
        .where(
          and(
            eq(addresses.addressLine1, data.addressLine1),
            !!data.addressLine2
              ? eq(addresses.addressLine2, data.addressLine2)
              : undefined,
            eq(addresses.city, data.city),
            eq(addresses.state, data.state),
            eq(addresses.postalCode, data.postalCode),
            eq(addresses.countryId, data.countryId),
          ),
        ),
    ),
  );

  const receiverIdQuery = db
    .$with('receiver_id_query')
    .as(db.insert(receivers).values(data).returning({ id: receivers.id }));

  const query = db
    .with(createdAddressQuery, addressIdQuery, receiverIdQuery)
    .select({
      addressId: addressIdQuery.id,
      receiverId: receiverIdQuery.id,
    })
    .from(addressIdQuery)
    .innerJoin(receiverIdQuery, sql`1 = 1`);

  const [result] = await query;

  return result;
};
