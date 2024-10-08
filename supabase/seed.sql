TRUNCATE TABLE categories, products, product_categories, tags, product_tags, product_images RESTART IDENTITY CASCADE;

WITH inserted_categories AS (
    INSERT INTO categories (name)
    VALUES 
        ('Electronics'),
        ('Home Appliances')
    RETURNING id, name
)

INSERT INTO categories (name, parent_category_id)
SELECT v.name, c.id
FROM (VALUES
    ('Smartphones', 'Electronics'),
    ('Laptops', 'Electronics'),
    ('Refrigerators', 'Home Appliances'),
    ('Washing Machines', 'Home Appliances')
) AS v(name, parent)
JOIN inserted_categories c ON c.name = v.parent;

WITH inserted_products AS (
    INSERT INTO products (name, description, price, currency, stock)
    VALUES
        ('Smartphone A', 'High-quality smartphone with latest features', 699, 'USD', 50),
        ('Laptop B', 'Powerful laptop for gaming and productivity', 999, 'USD', 30),
        ('Refrigerator C', 'Energy-efficient refrigerator with large capacity', 1199, 'USD', 20),
        ('Washing Machine D', 'Automatic washing machine with multiple modes', 499, 'USD', 40)
    RETURNING id, name
),
inserted_images AS (
    INSERT INTO product_images (product_id, image_path, placeholder, is_thumbnail)
    SELECT 
        ip.id, 
        v.image_path, 
        v.placeholder, 
        v.is_thumbnail
    FROM inserted_products ip
    JOIN (
        VALUES
            -- Smartphone A images
            ('Smartphone A', 'storage/v1/object/public/product-images/smartphone_a.webp', 'LAS$ovt7~qt7t7fQt7j[IUay%Mj[', true),
            ('Smartphone A', 'storage/v1/object/public/product-images/smartphone_a.webp', 'LAS$ovt7~qt7t7fQt7j[IUay%Mj[', false),
            ('Smartphone A', 'storage/v1/object/public/product-images/smartphone_a.webp', 'LAS$ovt7~qt7t7fQt7j[IUay%Mj[', false),
            ('Smartphone A', 'storage/v1/object/public/product-images/smartphone_a.webp', 'LAS$ovt7~qt7t7fQt7j[IUay%Mj[', false),

            -- Laptop B images
            ('Laptop B', 'storage/v1/object/public/product-images/laptop_b.webp', 'LQRW0bt7?bof~qWBM{ay4nof%Mj[', true),
            ('Laptop B', 'storage/v1/object/public/product-images/laptop_b.webp', 'LQRW0bt7?bof~qWBM{ay4nof%Mj[', false),
            ('Laptop B', 'storage/v1/object/public/product-images/laptop_b.webp', 'LQRW0bt7?bof~qWBM{ay4nof%Mj[', false),

            -- Refrigerator C images
            ('Refrigerator C', 'storage/v1/object/public/product-images/refrigerator_c.webp', 'LSRp8-WB~qxu-;WBIUt7xuayRjay', true),
            ('Refrigerator C', 'storage/v1/object/public/product-images/refrigerator_c.webp', 'LSRp8-WB~qxu-;WBIUt7xuayRjay', false),

            -- Washing Machine D images
            ('Washing Machine D', 'storage/v1/object/public/product-images/washing_machine_d.webp', 'LaOf}eSeR4ay*0R*X9WV%2aeRjjZ', true)
    ) AS v(product_name, image_path, placeholder, is_thumbnail)
    ON v.product_name = ip.name
)

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
