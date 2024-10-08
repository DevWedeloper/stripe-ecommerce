import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { GoBackButtonComponent } from 'src/app/shared/go-back-button.component';
import { QuantitySelectorComponent } from 'src/app/shared/quantity-selector.component';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { ProductsWithThumbnail } from 'src/db/types';
import { ProductDetailSkeletonComponent } from './product-detail-skeleton.component';
import { ProductDetailService } from './product-detail.service';
import { ProductImageGalleryComponent } from './product-image-gallery.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgOptimizedImage,
    HlmButtonDirective,
    HlmCardDirective,
    QuantitySelectorComponent,
    ProductDetailSkeletonComponent,
    GoBackButtonComponent,
    ProductImageGalleryComponent,
  ],
  providers: [ProductDetailService],
  template: `
    <app-go-back-button text="Go back" navigateBack />
    @if (!isLoading()) {
      @if (product()) {
        <div
          hlmCard
          class="grid animate-fade-in grid-cols-1 gap-8 p-4 md:grid-cols-2"
        >
          <div class="relative h-[600px] w-full rounded-lg">
            <app-product-image-gallery
              [imageObjects]="product()!.imageObjects"
              [alt]="product()!.name"
            />
          </div>

          <div class="flex flex-col justify-center">
            <h1 class="mb-4 text-3xl font-bold">
              {{ product()!.name }}
            </h1>
            <p class="mb-4">{{ product()!.description }}</p>
            <div class="mb-4 text-xl font-semibold">
              Price:
              {{ product()!.price | currency: product()!.currency }}
            </div>
            <div class="mb-4">
              Stock:
              {{ product()!.stock > 0 ? product()!.stock : 'Out of stock' }}
            </div>

            <app-quantity-selector
              [(quantity)]="quantity"
              [stock]="product()!.stock"
              class="mb-4"
            />

            <button
              hlmBtn
              [disabled]="product()!.stock <= 0"
              (click)="addToCart(product()!)"
            >
              Add to Cart
            </button>
          </div>
        </div>
      } @else {
        <div>Product not found...</div>
      }
    } @else {
      <app-product-detail-skeleton />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductDetailPageComponent {
  private productDetailService = inject(ProductDetailService);
  private shoppingCartService = inject(ShoppingCartService);

  protected quantity = signal(1);

  protected product = this.productDetailService.product;
  protected isLoading = this.productDetailService.isLoading;

  protected addToCart(product: ProductsWithThumbnail): void {
    this.shoppingCartService.addToCart({
      ...product,
      quantity: this.quantity(),
    });
  }
}
