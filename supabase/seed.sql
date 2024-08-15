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
    INSERT INTO products (name, description, price, currency, image_path, stock)
    VALUES
        ('Smartphone A', 'High-quality smartphone with latest features', 699, 'USD', 'storage/v1/object/public/product-images/smartphone_a.webp', 50),
        ('Laptop B', 'Powerful laptop for gaming and productivity', 999, 'USD', 'storage/v1/object/public/product-images/laptop_b.webp', 30),
        ('Refrigerator C', 'Energy-efficient refrigerator with large capacity', 1199, 'USD', 'storage/v1/object/public/product-images/refrigerator_c.webp', 20),
        ('Washing Machine D', 'Automatic washing machine with multiple modes', 499, 'USD', 'storage/v1/object/public/product-images/washing_machine_d.webp', 40)
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
