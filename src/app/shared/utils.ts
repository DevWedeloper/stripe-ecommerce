import { environment } from 'src/environments/environment';
import { positiveIntSchema } from 'src/schemas/zod-schemas';

export const getS3ImageUrl = (imagePath: string | null) => {
  const s3Url = environment.s3Url;
  return `${s3Url}/${imagePath}`;
};

export const parseToPositiveInt = (value: any, fallback: number): number => {
  const result = positiveIntSchema.safeParse(Number(value));
  return result.success ? result.data : fallback;
};
