import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import { formatPaginatedResult, ProductWithTotalCount } from '../utils';

export const getPaginatedProductsByCategoryName = async (
  categoryName: string,
  offset: number,
  pageSize: number,
): Promise<any> => {
  const query = sql`
    with recursive subcategories as (
      select id, name, parent_category_id
      from categories
      where name = ${categoryName}

      union all

      select c.id, c.name, c.parent_category_id
      from categories c
      inner join subcategories s on c.parent_category_id = s.id
    ),
    
    filtered_categories as (
      select id
      from subcategories
      where id not in (
        select parent_category_id
        from categories
        where parent_category_id is not null
      )
    )

    select distinct
      p.id, 
      p.name, 
      p.description, 
      p.currency, 
      pi.image_path as "imagePath", 
      pi.placeholder, 
      count(*) over() as "fullCount"
    from products p
    left join product_images pi on pi.product_id = p.id and pi.is_thumbnail = true
    inner join product_categories pc on pc.product_id = p.id
    where pc.category_id in (select id from filtered_categories)
    offset ${offset}
    limit ${pageSize}
  `;

  const productsResult = (await db.execute(query)) as ProductWithTotalCount[];

  const { products: productsArray, totalProducts } =
    formatPaginatedResult(productsResult);

  return {
    products: productsArray,
    totalProducts,
  };
};
