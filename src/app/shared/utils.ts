import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export const getS3ImageUrl = (imagePath: string | null) => {
  const s3Url = environment.s3Url;
  return `${s3Url}/${imagePath}`;
};

export const setQueryParams = (
  queryParams: {
    [key: string]: string | number;
  },
  route: ActivatedRoute,
  router: Router,
): void => {
  router.navigate([], {
    relativeTo: route,
    queryParams,
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
};
