import { InferSelectModel, sql } from 'drizzle-orm';
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const products = pgTable(
  'products',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    currency: text('currency').notNull(),
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

export const productItems = pgTable(
  'product_items',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productId: integer('product_id')
      .references(() => products.id)
      .notNull(),
    sku: text('sku').notNull(),
    stock: integer('stock').notNull(),
    price: integer('price').notNull(),
  },
  (t) => ({
    uniqueConstraint: unique().on(t.productId, t.sku),
    productIdIdx: index('product_items_product_id_idx').on(t.productId),
  }),
);

export const productImages = pgTable(
  'product_images',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productId: integer('product_id')
      .references(() => products.id)
      .notNull(),
    imagePath: text('image_path').notNull(),
    placeholder: text('placeholder').notNull(),
    isThumbnail: boolean('is_thumbnail').default(false),
  },
  (t) => ({
    uniqueThumbnail: uniqueIndex('unique_thumbnail_per_product')
      .on(t.productId, t.isThumbnail)
      .where(sql`(${t.isThumbnail} = true)`),
    productIdIdx: index('product_images_product_id_idx').on(t.productId),
  }),
);

export const categories = pgTable(
  'categories',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    parentCategoryId: integer('parent_category_id').references(
      (): AnyPgColumn => categories.id,
    ),
  },
  (t) => ({
    nameIdx: uniqueIndex('categories_name_idx').on(t.name),
    parentCategoryIdIdx: index('categories_parent_category_id_idx').on(
      t.parentCategoryId,
    ),
  }),
);

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
    pk: primaryKey({ columns: [t.productId, t.categoryId] }),
  }),
);

export const variations = pgTable('variations', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  name: text('name').notNull(),
});

export const variationOptions = pgTable(
  'variation_options',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    variationId: integer('variation_id')
      .notNull()
      .references(() => variations.id),
    value: text('value').notNull(),
  },
  (t) => ({
    variationIdIdx: index('variation_id_idx').on(t.variationId),
  }),
);

export const productConfiguration = pgTable(
  'product_configuration',
  {
    productItemId: integer('product_item_id')
      .notNull()
      .references(() => productItems.id),
    variationOptionId: integer('variation_option_id').references(
      () => variationOptions.id,
    ),
    variationId: integer('variation_id')
      .notNull()
      .references(() => variations.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productItemId, t.variationOptionId] }),
    uniqueVariationConstraint: unique().on(t.productItemId, t.variationId),
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
    pk: primaryKey({ columns: [t.productId, t.tagId] }),
  }),
);

export type Products = InferSelectModel<typeof products>;
export type ProductItems = InferSelectModel<typeof productItems>;
export type Categories = InferSelectModel<typeof categories>;
export type ProductImages = InferSelectModel<typeof productImages>;
export type Variations = InferSelectModel<typeof variations>;
export type VariationOptions = InferSelectModel<typeof variationOptions>;
