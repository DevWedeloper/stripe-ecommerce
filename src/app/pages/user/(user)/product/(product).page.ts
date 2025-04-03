import { RouteMeta } from '@analogjs/router';
import { Component } from '@angular/core';
import { metaWith } from 'src/app/shared/utils/meta';
import { CreateProductButtonComponent } from './features/create-product-button.component';
import { UserProductListComponent } from './features/user-product-list.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Product Listings',
    'Create new products and view your existing listings.',
  ),
  title: 'Stripe Ecommerce | Product Listings',
};

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CreateProductButtonComponent, UserProductListComponent],
  template: `
    <app-create-product-button />
    <app-user-product-list />
  `,
})
export default class ProductPageComponent {}
