import { Column, eq, getTableColumns, sql } from 'drizzle-orm';
import { ImageObject, ProductsWithAllImages } from 'src/db/types';
import { db } from '../..';
import { productImages, products } from '../../schema';

export const getProductById = async (
  id: number,
): Promise<ProductsWithAllImages | null> => {
  const maxQuery = (col: Column) =>
    sql<string>`
      max(case when ${productImages.isThumbnail} = true then ${col} end)
    `;

  const [product] = await db
    .select({
      ...getTableColumns(products),
      imagePath: maxQuery(productImages.imagePath),
      placeholder: maxQuery(productImages.placeholder),
      imageObjects: sql<
        ImageObject[]
      >`array_agg(json_build_object('imagePath', ${productImages.imagePath}, 'placeholder', ${productImages.placeholder}))`,
    })
    .from(products)
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(eq(products.id, id))
    .groupBy(products.id)
    .limit(1);
  return product || null;
};
