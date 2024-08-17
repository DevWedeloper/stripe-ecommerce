import type { Column } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const lower = (col: Column) => sql<string>`lower(${col})`;
