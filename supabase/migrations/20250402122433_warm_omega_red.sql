

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."order_status" AS ENUM (
    'Pending',
    'Processed',
    'Shipped',
    'Delivered',
    'Cancelled'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" integer NOT NULL,
    "address_line1" character varying(256) NOT NULL,
    "address_line2" character varying(256),
    "city" character varying(256) NOT NULL,
    "state" character varying(256) NOT NULL,
    "postal_code" character varying(256) NOT NULL,
    "country_id" integer NOT NULL
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


ALTER TABLE "public"."addresses" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."addresses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "parent_category_id" integer
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


ALTER TABLE "public"."categories" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" integer NOT NULL,
    "code" character(2) NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


ALTER TABLE "public"."countries" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."countries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" integer NOT NULL,
    "product_item_id" integer NOT NULL,
    "order_id" integer NOT NULL,
    "quantity" integer NOT NULL,
    "price" integer NOT NULL
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


ALTER TABLE "public"."order_items" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."order_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "order_date" timestamp without time zone NOT NULL,
    "shipping_address_id" integer NOT NULL,
    "total" integer NOT NULL,
    "status" "public"."order_status" DEFAULT 'Pending'::"public"."order_status" NOT NULL,
    "receiver_id" integer NOT NULL,
    "delivered_date" timestamp without time zone
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


ALTER TABLE "public"."orders" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."orders_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "product_id" integer NOT NULL,
    "category_id" integer NOT NULL
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_configuration" (
    "product_item_id" integer NOT NULL,
    "variation_option_id" integer NOT NULL,
    "variation_id" integer NOT NULL,
    "product_id" integer NOT NULL,
    "variation_product_id" integer NOT NULL,
    CONSTRAINT "product_configuration_product_check" CHECK (("product_id" = "variation_product_id"))
);


ALTER TABLE "public"."product_configuration" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" integer NOT NULL,
    "product_id" integer NOT NULL,
    "image_path" "text" NOT NULL,
    "placeholder" "text" NOT NULL,
    "is_thumbnail" boolean DEFAULT false,
    "order" smallint NOT NULL
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


ALTER TABLE "public"."product_images" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."product_images_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."product_items" (
    "id" integer NOT NULL,
    "product_id" integer NOT NULL,
    "sku" "text" NOT NULL,
    "stock" integer NOT NULL,
    "price" integer NOT NULL,
    CONSTRAINT "stock_check" CHECK (("stock" >= 0))
);


ALTER TABLE "public"."product_items" OWNER TO "postgres";


ALTER TABLE "public"."product_items" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."product_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."product_tags" (
    "product_id" integer NOT NULL,
    "tag_id" integer NOT NULL
);


ALTER TABLE "public"."product_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


ALTER TABLE "public"."products" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."receivers" (
    "id" integer NOT NULL,
    "full_name" character varying(256) NOT NULL
);


ALTER TABLE "public"."receivers" OWNER TO "postgres";


ALTER TABLE "public"."receivers" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."receivers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


ALTER TABLE "public"."tags" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_addresses" (
    "user_id" "uuid" NOT NULL,
    "address_id" integer NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "receiver_id" integer NOT NULL
);


ALTER TABLE "public"."user_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_reviews" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_item_id" integer NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    CONSTRAINT "user_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."user_reviews" OWNER TO "postgres";


ALTER TABLE "public"."user_reviews" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" character varying(256) NOT NULL,
    "avatar_path" "text",
    "is_deleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."variation_options" (
    "id" integer NOT NULL,
    "variation_id" integer NOT NULL,
    "value" "text" NOT NULL,
    "order" smallint NOT NULL
);


ALTER TABLE "public"."variation_options" OWNER TO "postgres";


ALTER TABLE "public"."variation_options" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."variation_options_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."variations" (
    "id" integer NOT NULL,
    "product_id" integer NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."variations" OWNER TO "postgres";


ALTER TABLE "public"."variations" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."variations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_code_unique" UNIQUE ("code");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY ("product_id", "category_id");



ALTER TABLE ONLY "public"."product_configuration"
    ADD CONSTRAINT "product_configuration_product_item_id_variation_id_unique" UNIQUE ("product_item_id", "variation_id");



ALTER TABLE ONLY "public"."product_configuration"
    ADD CONSTRAINT "product_configuration_product_item_id_variation_option_id_pk" PRIMARY KEY ("product_item_id", "variation_option_id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_items"
    ADD CONSTRAINT "product_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_items"
    ADD CONSTRAINT "product_items_product_id_sku_unique" UNIQUE ("product_id", "sku");



ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_product_id_tag_id_pk" PRIMARY KEY ("product_id", "tag_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."receivers"
    ADD CONSTRAINT "receivers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "unique_address" UNIQUE ("address_line1", "address_line2", "city", "state", "postal_code", "country_id");



ALTER TABLE ONLY "public"."user_reviews"
    ADD CONSTRAINT "unique_user_order_item" UNIQUE ("user_id", "order_item_id");



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_user_id_address_id_receiver_id_pk" PRIMARY KEY ("user_id", "address_id", "receiver_id");



ALTER TABLE ONLY "public"."user_reviews"
    ADD CONSTRAINT "user_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."variation_options"
    ADD CONSTRAINT "variation_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."variation_options"
    ADD CONSTRAINT "variation_options_variation_id_value_unique" UNIQUE ("variation_id", "value");



ALTER TABLE ONLY "public"."variations"
    ADD CONSTRAINT "variations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."variations"
    ADD CONSTRAINT "variations_product_id_name_unique" UNIQUE ("product_id", "name");



CREATE UNIQUE INDEX "categories_name_idx" ON "public"."categories" USING "btree" ("name");



CREATE INDEX "categories_parent_category_id_idx" ON "public"."categories" USING "btree" ("parent_category_id");



CREATE INDEX "order_items_order_id_idx" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "order_items_product_item_id_idx" ON "public"."order_items" USING "btree" ("product_item_id");



CREATE INDEX "orders_user_id_idx" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "product_images_product_id_idx" ON "public"."product_images" USING "btree" ("product_id");



CREATE INDEX "product_items_product_id_idx" ON "public"."product_items" USING "btree" ("product_id");



CREATE INDEX "search_index" ON "public"."products" USING "gin" ((("setweight"("to_tsvector"('"english"'::"regconfig", "name"), 'A'::"char") || "setweight"("to_tsvector"('"english"'::"regconfig", "description"), 'B'::"char"))));



CREATE INDEX "tags_search_index" ON "public"."tags" USING "gin" ("to_tsvector"('"english"'::"regconfig", "name"));



CREATE UNIQUE INDEX "unique_active_email" ON "public"."users" USING "btree" ("email") WHERE ("is_deleted" = false);



CREATE UNIQUE INDEX "unique_thumbnail_per_product" ON "public"."product_images" USING "btree" ("product_id", "is_thumbnail") WHERE ("is_thumbnail" = true);



CREATE UNIQUE INDEX "user_address_default_unique" ON "public"."user_addresses" USING "btree" ("user_id", "address_id", "is_default") WHERE ("is_default" = true);



CREATE INDEX "user_addresses_address_id_idx" ON "public"."user_addresses" USING "btree" ("address_id");



CREATE INDEX "user_addresses_user_id_idx" ON "public"."user_addresses" USING "btree" ("user_id");



CREATE INDEX "user_reviews_order_item_id_idx" ON "public"."user_reviews" USING "btree" ("order_item_id");



CREATE INDEX "user_reviews_user_id_idx" ON "public"."user_reviews" USING "btree" ("user_id");



CREATE INDEX "variation_id_idx" ON "public"."variation_options" USING "btree" ("variation_id");



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_category_id_categories_id_fk" FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_item_id_product_items_id_fk" FOREIGN KEY ("product_item_id") REFERENCES "public"."product_items"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_receiver_id_receivers_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."receivers"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_shipping_address_id_addresses_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."addresses"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."product_configuration"
    ADD CONSTRAINT "product_configuration_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."product_configuration"
    ADD CONSTRAINT "product_configuration_product_item_id_product_items_id_fk" FOREIGN KEY ("product_item_id") REFERENCES "public"."product_items"("id");



ALTER TABLE ONLY "public"."product_configuration"
    ADD CONSTRAINT "product_configuration_variation_id_variations_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."variations"("id");



ALTER TABLE ONLY "public"."product_configuration"
    ADD CONSTRAINT "product_configuration_variation_option_id_variation_options_id_" FOREIGN KEY ("variation_option_id") REFERENCES "public"."variation_options"("id");



ALTER TABLE ONLY "public"."product_configuration"
    ADD CONSTRAINT "product_configuration_variation_product_id_products_id_fk" FOREIGN KEY ("variation_product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."product_items"
    ADD CONSTRAINT "product_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_receiver_id_receivers_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."receivers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_reviews"
    ADD CONSTRAINT "user_reviews_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id");



ALTER TABLE ONLY "public"."user_reviews"
    ADD CONSTRAINT "user_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."variation_options"
    ADD CONSTRAINT "variation_options_variation_id_variations_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."variations"("id");



ALTER TABLE ONLY "public"."variations"
    ADD CONSTRAINT "variations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_configuration" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."receivers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."variation_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."variations" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."orders_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON TABLE "public"."product_configuration" TO "anon";
GRANT ALL ON TABLE "public"."product_configuration" TO "authenticated";
GRANT ALL ON TABLE "public"."product_configuration" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_images_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_items" TO "anon";
GRANT ALL ON TABLE "public"."product_items" TO "authenticated";
GRANT ALL ON TABLE "public"."product_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_tags" TO "anon";
GRANT ALL ON TABLE "public"."product_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."product_tags" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."receivers" TO "anon";
GRANT ALL ON TABLE "public"."receivers" TO "authenticated";
GRANT ALL ON TABLE "public"."receivers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."receivers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."receivers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."receivers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_addresses" TO "anon";
GRANT ALL ON TABLE "public"."user_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."user_reviews" TO "anon";
GRANT ALL ON TABLE "public"."user_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."user_reviews" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_reviews_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_reviews_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_reviews_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."variation_options" TO "anon";
GRANT ALL ON TABLE "public"."variation_options" TO "authenticated";
GRANT ALL ON TABLE "public"."variation_options" TO "service_role";



GRANT ALL ON SEQUENCE "public"."variation_options_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."variation_options_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."variation_options_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."variations" TO "anon";
GRANT ALL ON TABLE "public"."variations" TO "authenticated";
GRANT ALL ON TABLE "public"."variations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."variations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."variations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."variations_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();



CREATE POLICY "allow all 16wiy3a_0" ON "storage"."objects" FOR SELECT TO "authenticated" USING (("bucket_id" = 'product-images'::"text"));



CREATE POLICY "allow all 16wiy3a_1" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK (("bucket_id" = 'product-images'::"text"));



CREATE POLICY "allow all 16wiy3a_2" ON "storage"."objects" FOR UPDATE TO "authenticated" USING (("bucket_id" = 'product-images'::"text"));



CREATE POLICY "allow all 16wiy3a_3" ON "storage"."objects" FOR DELETE TO "authenticated" USING (("bucket_id" = 'product-images'::"text"));



CREATE POLICY "allow all 1oj01fe_0" ON "storage"."objects" FOR SELECT TO "authenticated" USING (("bucket_id" = 'avatars'::"text"));



CREATE POLICY "allow all 1oj01fe_1" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK (("bucket_id" = 'avatars'::"text"));



CREATE POLICY "allow all 1oj01fe_2" ON "storage"."objects" FOR UPDATE TO "authenticated" USING (("bucket_id" = 'avatars'::"text"));



CREATE POLICY "allow all 1oj01fe_3" ON "storage"."objects" FOR DELETE TO "authenticated" USING (("bucket_id" = 'avatars'::"text"));



