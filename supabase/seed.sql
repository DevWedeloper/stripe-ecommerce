-- Step 1: Truncate the tables to clear existing data
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- Step 2: Insert general categories and retrieve their IDs
WITH inserted_categories AS (
    INSERT INTO categories (name)
    VALUES 
        ('Electronics'),
        ('Home Appliances')
    RETURNING id, name
)

-- Step 3: Insert inner categories for the retrieved IDs
INSERT INTO categories (name, parent_category_id)
SELECT
    'Smartphones' AS name,
    (SELECT id FROM inserted_categories WHERE name = 'Electronics') AS parent_category_id
UNION ALL
SELECT
    'Laptops' AS name,
    (SELECT id FROM inserted_categories WHERE name = 'Electronics') AS parent_category_id
UNION ALL
SELECT
    'Refrigerators' AS name,
    (SELECT id FROM inserted_categories WHERE name = 'Home Appliances') AS parent_category_id
UNION ALL
SELECT
    'Washing Machines' AS name,
    (SELECT id FROM inserted_categories WHERE name = 'Home Appliances') AS parent_category_id;

-- Step 1: Truncate the tables to clear existing data
TRUNCATE TABLE products, product_categories RESTART IDENTITY CASCADE;

-- Step 2: Insert products and retrieve their IDs
WITH inserted_products AS (
    INSERT INTO products (name, description, price, currency, image_path, placeholder, stock)
    VALUES
        ('Smartphone A', 'High-quality smartphone with latest features', 699, 'USD', 'storage/v1/object/public/product-images/smartphone_a.webp', 'LAS$ovt7~qt7t7fQt7j[IUay%Mj[', 50),
        ('Laptop B', 'Powerful laptop for gaming and productivity', 999, 'USD', 'storage/v1/object/public/product-images/laptop_b.webp', 'LQRW0bt7?bof~qWBM{ay4nof%Mj[', 30),
        ('Refrigerator C', 'Energy-efficient refrigerator with large capacity', 1199, 'USD', 'storage/v1/object/public/product-images/refrigerator_c.webp', 'LSRp8-WB~qxu-;WBIUt7xuayRjay', 20),
        ('Washing Machine D', 'Automatic washing machine with multiple modes', 499, 'USD', 'storage/v1/object/public/product-images/washing_machine_d.webp', 'LaOf}eSeR4ay*0R*X9WV%2aeRjjZ', 40)
    RETURNING id, name
)

-- Step 3: Insert product categories
INSERT INTO product_categories (product_id, category_id)
SELECT
    ip.id AS product_id,
    c.id AS category_id
FROM
    inserted_products ip
    JOIN categories c ON (
        (ip.name = 'Smartphone A' AND c.name = 'Smartphones') OR
        (ip.name = 'Laptop B' AND c.name = 'Laptops') OR
        (ip.name = 'Refrigerator C' AND c.name = 'Refrigerators') OR
        (ip.name = 'Washing Machine D' AND c.name = 'Washing Machines')
    );

-- Step 1: Truncate the tables to clear existing data
TRUNCATE TABLE tags, product_tags RESTART IDENTITY CASCADE;

-- Step 2: Insert tags and retrieve their IDs
WITH inserted_tags AS (
    INSERT INTO tags (name)
    VALUES 
        ('New Arrival'),
        ('Discount'),
        ('Best Seller'),
        ('High Quality'),
        ('Eco-Friendly')
    RETURNING id, name
)

-- Step 3: Insert product tags
INSERT INTO product_tags (product_id, tag_id)
SELECT
    p.id AS product_id,
    t.id AS tag_id
FROM
    inserted_tags t
    JOIN products p ON (
        (t.name = 'New Arrival' AND p.name IN ('Smartphone A', 'Laptop B')) OR
        (t.name = 'Discount' AND p.name IN ('Washing Machine D')) OR
        (t.name = 'Best Seller' AND p.name IN ('Refrigerator C')) OR
        (t.name = 'High Quality' AND p.name IN ('Smartphone A', 'Laptop B', 'Refrigerator C')) OR
        (t.name = 'Eco-Friendly' AND p.name IN ('Refrigerator C'))
    );
