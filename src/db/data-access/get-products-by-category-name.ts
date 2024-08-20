import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '..';
import { Products, categories, productCategories, products } from '../schema';
import { lower } from './utils';

type PaginatedProducts = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalProducts: number;
  products: Products[];
};

const getCategoryAndChildCategoryIds = async (
  categoryId: number,
): Promise<number[]> => {
  const childCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.parentCategoryId, categoryId));

  const childCategoryIds = childCategories.map((category) => category.id);

  const nestedChildCategoryIds = await Promise.all(
    childCategoryIds.map((childCategoryId) =>
      getCategoryAndChildCategoryIds(childCategoryId),
    ),
  );

  return [categoryId, ...nestedChildCategoryIds.flat()];
};

const convertToQueryFormat = (name: string) => name.replace(/-/g, ' ');

export const getProductsByCategoryName = async (
  categoryName: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedProducts> => {
  if (page < 1 || pageSize < 1) {
    throw new Error('Page and pageSize must be positive integers.');
  }

  const categoryResult = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      eq(
        lower(categories.name),
        convertToQueryFormat(categoryName.toLocaleLowerCase()),
      ),
    )
    .limit(1);

  if (categoryResult.length === 0) {
    return {
      page,
      pageSize,
      totalPages: 0,
      totalProducts: 0,
      products: [],
    };
  }

  const categoryId = categoryResult[0].id;
  const allCategoryIds = await getCategoryAndChildCategoryIds(categoryId);

  const offset = (page - 1) * pageSize;

  const productResults = await db
    .selectDistinct({
      products,
      totalCount: sql<number>`count(*) over() AS full_count`,
    })
    .from(products)
    .where(
      inArray(
        products.id,
        db
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .where(inArray(productCategories.categoryId, allCategoryIds)),
      ),
    )
    .offset(offset)
    .limit(pageSize);

  const productsArray = productResults.map((result) => result.products);

  const totalProducts = productResults[0]?.totalCount || 0;
  const totalPages = Math.ceil(totalProducts / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    totalProducts,
    products: productsArray,
  };
};
