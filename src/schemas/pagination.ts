import { positiveIntSchema } from './shared/numbers';

export const paginationSchema = {
  page: positiveIntSchema,
  pageSize: positiveIntSchema,
};
