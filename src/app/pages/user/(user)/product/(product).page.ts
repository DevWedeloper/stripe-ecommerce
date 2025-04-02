import { Component } from '@angular/core';
import { CreateProductButtonComponent } from './features/create-product-button.component';
import { UserProductListComponent } from './features/user-product-list.component';

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
