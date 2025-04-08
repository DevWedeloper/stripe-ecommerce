TRUNCATE TABLE categories,
products,
product_categories,
tags,
product_tags,
product_images,
product_items,
variations,
variation_options,
product_configuration,
public.users,
auth.users,
addresses,
countries,
user_addresses,
orders,
order_items,
receivers,
user_reviews RESTART IDENTITY CASCADE;

WITH inserted_categories AS (
    INSERT INTO
        categories (name)
    VALUES
        ('Electronics'),
        ('Home Appliances') RETURNING id,
        name
)
INSERT INTO
    categories (name, parent_category_id)
SELECT
    v.name,
    c.id
FROM
    (
        VALUES
            ('Smartphones', 'Electronics'),
            ('Laptops', 'Electronics'),
            ('Refrigerators', 'Home Appliances'),
            ('Washing Machines', 'Home Appliances')
    ) AS v(name, parent)
    JOIN inserted_categories c ON c.name = v.parent;

INSERT INTO
    countries (code)
VALUES
    ('US');

WITH inserted_users AS (
    INSERT INTO
        auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
    SELECT
        '00000000-0000-0000-0000-000000000000',
        uuid_generate_v4(),
        'authenticated',
        'authenticated',
        'user@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}',
        '{}',
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        '' RETURNING id
),
inserted_addresses AS (
    INSERT INTO
        addresses (
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country_id
        )
    VALUES
        (
            '123 Main Street',
            'Apt 4B',
            'New York',
            'NY',
            '10001',
            1
        ) RETURNING id
),
inserted_receivers AS (
    INSERT INTO
        receivers (full_name)
    VALUES
        ('John Doe') RETURNING id
),
inserted_user_addresses AS (
    INSERT INTO
        user_addresses (
            user_id,
            address_id,
            receiver_id,
            is_default
        )
    SELECT
        u.id,
        a.id,
        r.id,
        true
    FROM
        inserted_users u,
        inserted_addresses a,
        inserted_receivers r
),
inserted_products AS (
    INSERT INTO
        products (user_id, name, description, is_deleted)
    SELECT
        u.id,
        p.name,
        p.description,
        false
    FROM
        inserted_users u
        CROSS JOIN (
            VALUES
                (
                    'Smartphone A',
                    'High-quality smartphone with latest features'
                ),
                (
                    'Laptop B',
                    'Powerful laptop for gaming and productivity'
                ),
                (
                    'Refrigerator C',
                    'Energy-efficient refrigerator with large capacity'
                ),
                (
                    'Washing Machine D',
                    'Automatic washing machine with multiple modes'
                )
        ) AS p(name, description) RETURNING id,
        name
),
inserted_items AS (
    INSERT INTO
        product_items (product_id, sku, stock, price)
    SELECT
        ip.id,
        v.sku,
        v.stock,
        v.price
    FROM
        (
            VALUES
                -- Smartphone A combinations
                ('Smartphone A', 'SKU_A_64GB_Black', 30, 699),
                ('Smartphone A', 'SKU_A_64GB_Blue', 0, 699),
                ('Smartphone A', 'SKU_A_64GB_Red', 20, 649),
                ('Smartphone A', 'SKU_A_128GB_Black', 15, 749),
                ('Smartphone A', 'SKU_A_128GB_Blue', 10, 699),
                ('Smartphone A', 'SKU_A_128GB_Red', 5, 699),
                ('Smartphone A', 'SKU_A_256GB_Black', 25, 799),
                ('Smartphone A', 'SKU_A_256GB_Blue', 0, 749),
                ('Smartphone A', 'SKU_A_256GB_Red', 18, 799),
                -- Laptop B combinations
                ('Laptop B', 'SKU_B_8GB_Gray', 30, 999),
                ('Laptop B', 'SKU_B_8GB_Silver', 5, 949),
                ('Laptop B', 'SKU_B_8GB_Black', 0, 999),
                ('Laptop B', 'SKU_B_16GB_Gray', 25, 1099),
                ('Laptop B', 'SKU_B_16GB_Silver', 20, 1099),
                ('Laptop B', 'SKU_B_16GB_Black', 15, 999),
                ('Laptop B', 'SKU_B_32GB_Gray', 10, 1199),
                ('Laptop B', 'SKU_B_32GB_Silver', 0, 1149),
                ('Laptop B', 'SKU_B_32GB_Black', 12, 1199),
                -- Refrigerator C combinations
                ('Refrigerator C', 'SKU_C_300L_White', 20, 1199),
                ('Refrigerator C', 'SKU_C_300L_Silver', 0, 1199),
                ('Refrigerator C', 'SKU_C_300L_Black', 15, 1149),
                ('Refrigerator C', 'SKU_C_400L_White', 25, 1299),
                ('Refrigerator C', 'SKU_C_400L_Silver', 20, 1249),
                ('Refrigerator C', 'SKU_C_400L_Black', 10, 1299),
                ('Refrigerator C', 'SKU_C_500L_White', 5, 1399),
                ('Refrigerator C', 'SKU_C_500L_Silver', 0, 1349),
                ('Refrigerator C', 'SKU_C_500L_Black', 15, 1349),
                -- Washing Machine D combinations
                (
                    'Washing Machine D',
                    'SKU_D_FrontLoad_White',
                    40,
                    499
                ),
                (
                    'Washing Machine D',
                    'SKU_D_FrontLoad_Gray',
                    0,
                    479
                ),
                (
                    'Washing Machine D',
                    'SKU_D_FrontLoad_Silver',
                    35,
                    489
                ),
                (
                    'Washing Machine D',
                    'SKU_D_TopLoad_White',
                    30,
                    459
                ),
                (
                    'Washing Machine D',
                    'SKU_D_TopLoad_Gray',
                    20,
                    439
                ),
                (
                    'Washing Machine D',
                    'SKU_D_TopLoad_Silver',
                    0,
                    439
                )
        ) AS v(product_name, sku, stock, price)
        JOIN inserted_products ip ON ip.name = v.product_name RETURNING id,
        product_id
),
inserted_images AS (
    INSERT INTO
        product_images (
            product_id,
            image_path,
            placeholder,
            is_thumbnail,
            "order"
        )
    SELECT
        ip.id,
        v.image_path,
        v.placeholder,
        v.is_thumbnail,
        v.order
    FROM
        inserted_products ip
        JOIN (
            VALUES
                -- Smartphone A images
                (
                    'Smartphone A',
                    'smartphone_a.webp',
                    'LAS$ovt7~qt7t7fQt7j[IUay%Mj[',
                    true,
                    1
                ),
                (
                    'Smartphone A',
                    'smartphone_a.webp',
                    'LAS$ovt7~qt7t7fQt7j[IUay%Mj[',
                    false,
                    2
                ),
                (
                    'Smartphone A',
                    'smartphone_a.webp',
                    'LAS$ovt7~qt7t7fQt7j[IUay%Mj[',
                    false,
                    3
                ),
                (
                    'Smartphone A',
                    'smartphone_a.webp',
                    'LAS$ovt7~qt7t7fQt7j[IUay%Mj[',
                    false,
                    4
                ),
                -- Laptop B images
                (
                    'Laptop B',
                    'laptop_b.webp',
                    'LQRW0bt7?bof~qWBM{ay4nof%Mj[',
                    true,
                    1
                ),
                (
                    'Laptop B',
                    'laptop_b.webp',
                    'LQRW0bt7?bof~qWBM{ay4nof%Mj[',
                    false,
                    2
                ),
                (
                    'Laptop B',
                    'laptop_b.webp',
                    'LQRW0bt7?bof~qWBM{ay4nof%Mj[',
                    false,
                    3
                ),
                -- Refrigerator C images
                (
                    'Refrigerator C',
                    'refrigerator_c.webp',
                    'LSRp8-WB~qxu-;WBIUt7xuayRjay',
                    true,
                    1
                ),
                (
                    'Refrigerator C',
                    'refrigerator_c.webp',
                    'LSRp8-WB~qxu-;WBIUt7xuayRjay',
                    false,
                    2
                ),
                -- Washing Machine D images
                (
                    'Washing Machine D',
                    'washing_machine_d.webp',
                    'LaOf}eSeR4ay*0R*X9WV%2aeRjjZ',
                    true,
                    1
                )
        ) AS v(
            product_name,
            image_path,
            placeholder,
            is_thumbnail,
            "order"
        ) ON v.product_name = ip.name
)
INSERT INTO
    product_categories (product_id, category_id)
SELECT
    ip.id AS product_id,
    c.id AS category_id
FROM
    inserted_products ip
    JOIN categories c ON (
        (
            ip.name = 'Smartphone A'
            AND c.name = 'Smartphones'
        )
        OR (
            ip.name = 'Laptop B'
            AND c.name = 'Laptops'
        )
        OR (
            ip.name = 'Refrigerator C'
            AND c.name = 'Refrigerators'
        )
        OR (
            ip.name = 'Washing Machine D'
            AND c.name = 'Washing Machines'
        )
    );

WITH inserted_tags AS (
    INSERT INTO
        tags (name)
    VALUES
        ('New Arrival'),
        ('Discount'),
        ('Best Seller'),
        ('High Quality'),
        ('Eco-Friendly') RETURNING id,
        name
)
INSERT INTO
    product_tags (product_id, tag_id)
SELECT
    p.id AS product_id,
    t.id AS tag_id
FROM
    inserted_tags t
    JOIN products p ON (
        (
            t.name = 'New Arrival'
            AND p.name IN ('Smartphone A', 'Laptop B')
        )
        OR (
            t.name = 'Discount'
            AND p.name IN ('Washing Machine D')
        )
        OR (
            t.name = 'Best Seller'
            AND p.name IN ('Refrigerator C')
        )
        OR (
            t.name = 'High Quality'
            AND p.name IN ('Smartphone A', 'Laptop B', 'Refrigerator C')
        )
        OR (
            t.name = 'Eco-Friendly'
            AND p.name IN ('Refrigerator C')
        )
    );

INSERT INTO
    variations (name, product_id)
SELECT
    v.variation_name,
    p.id AS product_id
FROM
    (
        VALUES
            -- Variations for Smartphone A
            ('Color', 'Smartphone A'),
            ('Storage Capacity', 'Smartphone A'),
            -- Variations for Laptop B
            ('Color', 'Laptop B'),
            ('RAM Size', 'Laptop B'),
            -- Variations for Refrigerator C
            ('Color', 'Refrigerator C'),
            ('Capacity', 'Refrigerator C'),
            -- Variations for Washing Machine D
            ('Color', 'Washing Machine D'),
            ('Load Type', 'Washing Machine D')
    ) AS v(variation_name, product_name)
    JOIN products p ON p.name = v.product_name;

INSERT INTO
    variation_options (variation_id, value, "order")
SELECT
    v.id,
    o.value,
    o."order"
FROM
    (
        -- Fetching variations and adding options with manual order
        VALUES
            -- Options for "Color" in "Smartphones" (order explicitly set)
            ('Color', 'Smartphones', 'Red', 1),
            ('Color', 'Smartphones', 'Blue', 2),
            ('Color', 'Smartphones', 'Black', 3),
            -- Options for "Storage Capacity" in "Smartphones" (order explicitly set)
            ('Storage Capacity', 'Smartphones', '64GB', 1),
            ('Storage Capacity', 'Smartphones', '128GB', 2),
            ('Storage Capacity', 'Smartphones', '256GB', 3),
            -- Options for "Color" in "Laptops" (order explicitly set)
            ('Color', 'Laptops', 'Gray', 1),
            ('Color', 'Laptops', 'Silver', 2),
            ('Color', 'Laptops', 'Black', 3),
            -- Options for "RAM Size" in "Laptops" (order explicitly set)
            ('RAM Size', 'Laptops', '8GB', 1),
            ('RAM Size', 'Laptops', '16GB', 2),
            ('RAM Size', 'Laptops', '32GB', 3),
            -- Options for "Color" in "Refrigerators" (order explicitly set)
            ('Color', 'Refrigerators', 'White', 1),
            ('Color', 'Refrigerators', 'Silver', 2),
            ('Color', 'Refrigerators', 'Black', 3),
            -- Options for "Capacity" in "Refrigerators" (order explicitly set)
            ('Capacity', 'Refrigerators', '300L', 1),
            ('Capacity', 'Refrigerators', '400L', 2),
            ('Capacity', 'Refrigerators', '500L', 3),
            -- Options for "Color" in "Washing Machines" (order explicitly set)
            ('Color', 'Washing Machines', 'White', 1),
            ('Color', 'Washing Machines', 'Gray', 2),
            ('Color', 'Washing Machines', 'Silver', 3),
            -- Options for "Load Type" in "Washing Machines" (order explicitly set)
            ('Load Type', 'Washing Machines', 'Front Load', 1),
            ('Load Type', 'Washing Machines', 'Top Load', 2)
    ) AS o(variation_name, category_name, value, "order")
    JOIN variations v ON v.name = o.variation_name
    JOIN product_categories pc ON pc.product_id = v.product_id
    JOIN categories c ON c.id = pc.category_id
    AND c.name = o.category_name;

WITH product_variation_mapping AS (
    SELECT
        pi.id AS product_item_id,
        vo.id AS variation_option_id,
        v.id AS variation_id,
        pi.product_id AS product_id,
        v.product_id AS variation_product_id
    FROM
        product_items pi
        JOIN products p ON p.id = pi.product_id
        JOIN variations v ON v.product_id = p.id
        JOIN variation_options vo ON vo.variation_id = v.id
    WHERE
        -- Ensure each product_item corresponds only to unique variation options
        (
            p.name = 'Smartphone A'
            AND (
                (
                    vo.value IN ('Black')
                    AND pi.sku IN (
                        'SKU_A_64GB_Black',
                        'SKU_A_128GB_Black',
                        'SKU_A_256GB_Black'
                    )
                )
                OR (
                    vo.value IN ('Blue')
                    AND pi.sku IN (
                        'SKU_A_64GB_Blue',
                        'SKU_A_128GB_Blue',
                        'SKU_A_256GB_Blue'
                    )
                )
                OR (
                    vo.value IN ('Red')
                    AND pi.sku IN (
                        'SKU_A_64GB_Red',
                        'SKU_A_128GB_Red',
                        'SKU_A_256GB_Red'
                    )
                )
                OR (
                    vo.value IN ('64GB')
                    AND pi.sku IN (
                        'SKU_A_64GB_Black',
                        'SKU_A_64GB_Blue',
                        'SKU_A_64GB_Red'
                    )
                )
                OR (
                    vo.value IN ('128GB')
                    AND pi.sku IN (
                        'SKU_A_128GB_Black',
                        'SKU_A_128GB_Blue',
                        'SKU_A_128GB_Red'
                    )
                )
                OR (
                    vo.value IN ('256GB')
                    AND pi.sku IN (
                        'SKU_A_256GB_Black',
                        'SKU_A_256GB_Blue',
                        'SKU_A_256GB_Red'
                    )
                )
            )
        )
        OR (
            p.name = 'Laptop B'
            AND (
                (
                    vo.value IN ('Gray')
                    AND pi.sku IN (
                        'SKU_B_8GB_Gray',
                        'SKU_B_16GB_Gray',
                        'SKU_B_32GB_Gray'
                    )
                )
                OR (
                    vo.value IN ('Silver')
                    AND pi.sku IN (
                        'SKU_B_8GB_Silver',
                        'SKU_B_16GB_Silver',
                        'SKU_B_32GB_Silver'
                    )
                )
                OR (
                    vo.value IN ('Black')
                    AND pi.sku IN (
                        'SKU_B_8GB_Black',
                        'SKU_B_16GB_Black',
                        'SKU_B_32GB_Black'
                    )
                )
                OR (
                    vo.value IN ('8GB')
                    AND pi.sku IN (
                        'SKU_B_8GB_Gray',
                        'SKU_B_8GB_Silver',
                        'SKU_B_8GB_Black'
                    )
                )
                OR (
                    vo.value IN ('16GB')
                    AND pi.sku IN (
                        'SKU_B_16GB_Gray',
                        'SKU_B_16GB_Silver',
                        'SKU_B_16GB_Black'
                    )
                )
                OR (
                    vo.value IN ('32GB')
                    AND pi.sku IN (
                        'SKU_B_32GB_Gray',
                        'SKU_B_32GB_Silver',
                        'SKU_B_32GB_Black'
                    )
                )
            )
        )
        OR (
            p.name = 'Refrigerator C'
            AND (
                (
                    vo.value IN ('White')
                    AND pi.sku IN (
                        'SKU_C_300L_White',
                        'SKU_C_400L_White',
                        'SKU_C_500L_White'
                    )
                )
                OR (
                    vo.value IN ('Silver')
                    AND pi.sku IN (
                        'SKU_C_300L_Silver',
                        'SKU_C_400L_Silver',
                        'SKU_C_500L_Silver'
                    )
                )
                OR (
                    vo.value IN ('Black')
                    AND pi.sku IN (
                        'SKU_C_300L_Black',
                        'SKU_C_400L_Black',
                        'SKU_C_500L_Black'
                    )
                )
                OR (
                    vo.value IN ('300L')
                    AND pi.sku IN (
                        'SKU_C_300L_White',
                        'SKU_C_300L_Silver',
                        'SKU_C_300L_Black'
                    )
                )
                OR (
                    vo.value IN ('400L')
                    AND pi.sku IN (
                        'SKU_C_400L_White',
                        'SKU_C_400L_Silver',
                        'SKU_C_400L_Black'
                    )
                )
                OR (
                    vo.value IN ('500L')
                    AND pi.sku IN (
                        'SKU_C_500L_White',
                        'SKU_C_500L_Silver',
                        'SKU_C_500L_Black'
                    )
                )
            )
        )
        OR (
            p.name = 'Washing Machine D'
            AND (
                (
                    vo.value IN ('White')
                    AND pi.sku IN ('SKU_D_FrontLoad_White', 'SKU_D_TopLoad_White')
                )
                OR (
                    vo.value IN ('Gray')
                    AND pi.sku IN ('SKU_D_FrontLoad_Gray', 'SKU_D_TopLoad_Gray')
                )
                OR (
                    vo.value IN ('Silver')
                    AND pi.sku IN ('SKU_D_FrontLoad_Silver', 'SKU_D_TopLoad_Silver')
                )
                OR (
                    vo.value IN ('Front Load')
                    AND pi.sku IN (
                        'SKU_D_FrontLoad_White',
                        'SKU_D_FrontLoad_Gray',
                        'SKU_D_FrontLoad_Silver'
                    )
                )
                OR (
                    vo.value IN ('Top Load')
                    AND pi.sku IN (
                        'SKU_D_TopLoad_White',
                        'SKU_D_TopLoad_Gray',
                        'SKU_D_TopLoad_Silver'
                    )
                )
            )
        )
)
INSERT INTO
    product_configuration (
        product_item_id,
        variation_option_id,
        variation_id,
        product_id,
        variation_product_id
    )
SELECT
    product_item_id,
    variation_option_id,
    variation_id,
    product_id,
    variation_product_id
FROM
    product_variation_mapping;