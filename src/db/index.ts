import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getEnvVar } from 'src/env';

const client = postgres(getEnvVar('DATABASE_URL'), {
  prepare: false,
});
export const db = drizzle(client);
