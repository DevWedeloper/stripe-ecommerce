import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getEnvVar } from 'src/env';

const client = postgres(getEnvVar('DATABASE_URL'), {
  prepare: false,
  idle_timeout: 20,
});
export const db = drizzle(client);
