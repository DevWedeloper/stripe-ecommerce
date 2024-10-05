import { Routes, UrlSegment } from '@angular/router';

export const routes: Routes = [
  {
    path: 'category',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'category',
    loadComponent: () => import('./pages/(main).page').then((m) => m.default),
    children: [
      {
        matcher: (url) => {
          const alphabeticRegex = /^[A-Za-z-]+$/;
          const isValid = url.every((segment) =>
            alphabeticRegex.test(segment.path),
          );

          if (url.length > 0 && isValid) {
            return {
              consumed: url,
              posParams: {
                path: new UrlSegment(
                  url.map((segment) => segment.path).join('/'),
                  {},
                ),
                categoryName: new UrlSegment(url[url.length - 1].path, {}),
              },
            };
          }
          return null;
        },
        loadComponent: () =>
          import('./pages/(main)/category/product-lists.component').then(
            (m) => m.ProductListsComponent,
          ),
      },
    ],
  },
];
