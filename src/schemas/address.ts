import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { addresses, receivers } from 'src/db/schema';
import { z } from 'zod';

export const createAddressSchema = createInsertSchema(addresses).merge(
  createInsertSchema(receivers),
);

export type CreateAddressSchema = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = z.object({
  address: createSelectSchema(addresses),
  receiver: createSelectSchema(receivers),
});

export type UpdateAddressSchema = z.infer<typeof updateAddressSchema>;
