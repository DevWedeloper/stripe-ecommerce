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
    stock: integer('stock').notNull(),
  },
  (t) => ({
    searchIndex: index('search_index').using(
      'gin',
      sql`(
        setweight(to_tsvector('english', ${t.name}), 'A') ||
        setweight(to_tsvector('english', ${t.description}), 'B')
      )`,
    ),
  }),
);

export const productImages = pgTable('product_images', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  imagePath: text('image_path').notNull(),
  placeholder: text('placeholder').notNull(),
});

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

export const tags = pgTable(
  'tags',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull().unique(),
  },
  (t) => ({
    searchIndex: index('tags_search_index').using(
      'gin',
      sql`to_tsvector('english', ${t.name})`,
    ),
  }),
);

export const productTags = pgTable(
  'product_tags',
  {
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    uniqueConstraint: unique().on(t.productId, t.tagId),
  }),
);

export type Products = InferSelectModel<typeof products>;
export type Categories = InferSelectModel<typeof categories>;
