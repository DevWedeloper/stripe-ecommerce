import { InferSelectModel, sql } from 'drizzle-orm';
import {
  AnyPgColumn,
  index,
  integer,
  pgTable,
  text,
  unique,
} from 'drizzle-orm/pg-core';

export const products = pgTable(
  'products',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: integer('price').notNull(),
    currency: text('currency').notNull(),
    imagePath: text('image_path'),
    stock: integer('stock').notNull(),
  },
  (table) => ({
    searchIndex: index('search_index').using(
      'gin',
      sql`(
        setweight(to_tsvector('english', ${table.name}), 'A') ||
        setweight(to_tsvector('english', ${table.description}), 'B')
      )`,
    ),
  }),
);

export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull().unique(),
  parentCategoryId: integer('parent_category_id').references(
    (): AnyPgColumn => categories.id,
  ),
});

export const productCategories = pgTable(
  'product_categories',
  {
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id),
  },
  (t) => ({
    uniqueConstraint: unique().on(t.productId, t.categoryId),
  }),
);

export type Products = InferSelectModel<typeof products>;
export type Categories = InferSelectModel<typeof categories>;
