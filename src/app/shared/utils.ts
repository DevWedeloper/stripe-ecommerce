import { environment } from 'src/environments/environment';

export const getS3ImageUrl = (imagePath: string | null) => {
  const s3Url = environment.s3Url;
  return `${s3Url}/${imagePath}`;
};
