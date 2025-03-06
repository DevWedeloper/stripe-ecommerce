import { createSelectSchema } from 'drizzle-zod';
import { addresses, receivers } from 'src/db/schema';
import { z } from 'zod';

export const updateAddressSchema = z.object({
  address: createSelectSchema(addresses),
  receiver: createSelectSchema(receivers),
});

export type UpdateAddressSchema = z.infer<typeof updateAddressSchema>;
