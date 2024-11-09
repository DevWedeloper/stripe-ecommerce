import { positiveIntSchema } from 'src/schemas/zod-schemas';

export const parseToPositiveInt = (value: any, fallback: number): number => {
  const result = positiveIntSchema.safeParse(Number(value));
  return result.success ? result.data : fallback;
};

export const convertToURLFormat = (name: string) =>
  name.replace(/\s+/g, '-').toLowerCase();
