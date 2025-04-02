import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm';
import {
  AnyPgColumn,
  boolean,
  char,
  check,
  index,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => authUsers.id)
      .notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    avatarPath: text('avatar_path'),
    isDeleted: boolean('is_deleted').notNull().default(false),
  },
  (t) => [
    uniqueIndex('unique_active_email')
      .on(t.email)
      .where(sql`${t.isDeleted} = false`),
  ],
).enableRLS();

export const countries = pgTable('countries', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: char('code', { length: 2 }).notNull().unique(),
}).enableRLS();

export const addresses = pgTable(
  'addresses',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    addressLine1: varchar('address_line1', { length: 256 }).notNull(),
    addressLine2: varchar('address_line2', { length: 256 }),
    city: varchar('city', { length: 256 }).notNull(),
    state: varchar('state', { length: 256 }).notNull(),
    postalCode: varchar('postal_code', { length: 256 }).notNull(),
    countryId: integer('country_id')
      .notNull()
      .references(() => countries.id),
  },
  (t) => [
    unique('unique_address').on(
      t.addressLine1,
      t.addressLine2,
      t.city,
      t.state,
      t.postalCode,
      t.countryId,
    ),
  ],
).enableRLS();

export const receivers = pgTable('receivers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  fullName: varchar('full_name', { length: 256 }).notNull(),
}).enableRLS();

export const userAddresses = pgTable(
  'user_addresses',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    addressId: integer('address_id')
      .references(() => addresses.id, { onDelete: 'cascade' })
      .notNull(),
    receiverId: integer('receiver_id')
      .references(() => receivers.id, { onDelete: 'cascade' })
      .notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.addressId, t.receiverId] }),
    uniqueIndex('user_address_default_unique')
      .on(t.userId, t.addressId, t.isDefault)
      .where(sql`(${t.isDefault} = true)`),
    unique('unique_receiver_id').on(t.receiverId),
    index('user_addresses_user_id_idx').on(t.userId),
    index('user_addresses_address_id_idx').on(t.addressId),
  ],
).enableRLS();

export const orderStatusEnum = pgEnum('order_status', [
  'Pending',
  'Processed',
  'Shipped',
  'Delivered',
  'Cancelled',
]);

export const orders = pgTable(
  'orders',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid('user_id').references(() => users.id),
    orderDate: timestamp('order_date').notNull(),
    deliveredDate: timestamp('delivered_date'),
    shippingAddressId: integer('shipping_address_id')
      .references(() => addresses.id)
      .notNull(),
    receiverId: integer('receiver_id')
      .references(() => receivers.id)
      .notNull(),
    total: integer('total').notNull(),
    status: orderStatusEnum('status').notNull().default('Pending'),
  },
  (t) => [index('orders_user_id_idx').on(t.userId)],
).enableRLS();

export const orderItems = pgTable(
  'order_items',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productItemId: integer('product_item_id')
      .references(() => productItems.id)
      .notNull(),
    orderId: integer('order_id')
      .references(() => orders.id)
      .notNull(),
    quantity: integer('quantity').notNull(),
    price: integer('price').notNull(),
  },
  (t) => [
    index('order_items_order_id_idx').on(t.orderId),
    index('order_items_product_item_id_idx').on(t.productItemId),
  ],
).enableRLS();

export const products = pgTable(
  'products',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
  },
  (t) => [
    index('search_index').using(
      'gin',
      sql`(
        setweight(to_tsvector('english', ${t.name}), 'A') ||
        setweight(to_tsvector('english', ${t.description}), 'B')
      )`,
    ),
  ],
).enableRLS();

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
  (t) => [
    unique('unique_constraint').on(t.productId, t.sku),
    index('product_items_product_id_idx').on(t.productId),
    check('stock_check', sql`${t.stock} >= 0`),
  ],
).enableRLS();

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
    order: smallint('order').notNull(),
  },
  (t) => [
    uniqueIndex('unique_thumbnail_per_product')
      .on(t.productId, t.isThumbnail)
      .where(sql`(${t.isThumbnail} = true)`),
    index('product_images_product_id_idx').on(t.productId),
  ],
).enableRLS();

export const categories = pgTable(
  'categories',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    parentCategoryId: integer('parent_category_id').references(
      (): AnyPgColumn => categories.id,
      { onDelete: 'set null' },
    ),
  },
  (t) => [
    uniqueIndex('categories_name_idx').on(t.name),
    index('categories_parent_category_id_idx').on(t.parentCategoryId),
  ],
).enableRLS();

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
  (t) => [primaryKey({ columns: [t.productId, t.categoryId] })],
).enableRLS();

export const variations = pgTable(
  'variations',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    name: text('name').notNull(),
  },
  (t) => [unique().on(t.productId, t.name)],
).enableRLS();

export const variationOptions = pgTable(
  'variation_options',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    variationId: integer('variation_id')
      .notNull()
      .references(() => variations.id),
    value: text('value').notNull(),
    order: smallint('order').notNull(),
  },
  (t) => [
    index('variation_id_idx').on(t.variationId),
    unique().on(t.variationId, t.value),
  ],
).enableRLS();

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
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    variationProductId: integer('variation_product_id')
      .notNull()
      .references(() => products.id),
  },
  (t) => [
    primaryKey({ columns: [t.productItemId, t.variationOptionId] }),
    unique().on(t.productItemId, t.variationId),
    check(
      'product_configuration_product_check',
      sql`${t.productId} = ${t.variationProductId}`,
    ),
  ],
).enableRLS();

export const tags = pgTable(
  'tags',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull().unique(),
  },
  (t) => [
    index('tags_search_index').using(
      'gin',
      sql`to_tsvector('english', ${t.name})`,
    ),
  ],
).enableRLS();

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
  (t) => [primaryKey({ columns: [t.productId, t.tagId] })],
).enableRLS();

export const userReviews = pgTable(
  'user_reviews',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    orderItemId: integer('order_item_id')
      .references(() => orderItems.id)
      .notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
  },
  (t) => [
    index('user_reviews_user_id_idx').on(t.userId),
    index('user_reviews_order_item_id_idx').on(t.orderItemId),
    check('user_reviews_rating_check', sql`${t.rating} between 1 and 5`),
    unique('unique_user_order_item').on(t.userId, t.orderItemId),
  ],
).enableRLS();

export type CountrySelect = InferSelectModel<typeof countries>;
export type AddressSelect = InferSelectModel<typeof addresses>;
export type AddressInsert = InferInsertModel<typeof addresses>;
export type ReceiverSelect = InferSelectModel<typeof receivers>;
export type ReceiverInsert = InferInsertModel<typeof receivers>;
export type UserAddressesSelect = InferSelectModel<typeof userAddresses>;
export type OrderStatusEnum = (typeof orderStatusEnum.enumValues)[number];
export type OrderSelect = InferSelectModel<typeof orders>;
export type OrderItemsSelect = InferSelectModel<typeof orderItems>;
export type Products = InferSelectModel<typeof products>;
export type ProductInsert = InferInsertModel<typeof products>;
export type ProductItems = InferSelectModel<typeof productItems>;
export type ProductItemsInsert = InferInsertModel<typeof productItems>;
export type Categories = InferSelectModel<typeof categories>;
export type ProductImages = InferSelectModel<typeof productImages>;
export type ProductImagesInsert = InferInsertModel<typeof productImages>;
export type Variations = InferSelectModel<typeof variations>;
export type VariationsInsert = InferInsertModel<typeof variations>;
export type VariationOptions = InferSelectModel<typeof variationOptions>;
export type VariationOptionsInsert = InferInsertModel<typeof variationOptions>;
export type ProductConfigurationInsert = InferInsertModel<
  typeof productConfiguration
>;
export type TagsSelect = InferSelectModel<typeof tags>;
export type ProductTagsInsert = InferInsertModel<typeof productTags>;
export type UserReviewsSelect = InferSelectModel<typeof userReviews>;
export type UserReviewsInsert = InferInsertModel<typeof userReviews>;
