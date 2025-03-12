import { sql } from 'drizzle-orm';
import { db } from 'src/db';
import { ProductWithImageAndPricing } from 'src/db/types';
import { formatPaginatedResult, ProductWithTotalCount } from '../utils';

export const getPaginatedProductsByCategoryName = async (
  categoryName: string,
  offset: number,
  pageSize: number,
): Promise<{
  products: ProductWithImageAndPricing[];
  totalProducts: number;
}> => {
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
    ),

    product_lowest_prices as (
      select product_id, min(price) as lowestPrice
      from product_items
      group by product_id
    )

    select distinct
      p.id,
      p.user_id as "userId", 
      p.name, 
      p.description, 
      pi.image_path as "imagePath", 
      pi.placeholder, 
      plp.lowestPrice as "lowestPrice", 
      count(*) over() as "totalCount"
    from products p
    inner join product_categories pc on pc.product_id = p.id
    inner join product_lowest_prices plp on plp.product_id = p.id 
    left join product_images pi on pi.product_id = p.id and pi.is_thumbnail = true
    where pc.category_id in (select id from filtered_categories)
    and p.is_deleted = false
    offset ${offset}
    limit ${pageSize};
  `;

  const productsResult = (await db.execute(query)) as ProductWithTotalCount[];

  const { data, totalCount: totalProducts } =
    formatPaginatedResult(productsResult);

  return {
    products: data,
    totalProducts,
  };
};
