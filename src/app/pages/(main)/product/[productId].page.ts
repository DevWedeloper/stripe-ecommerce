import { CurrencyPipe, KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { EmptyProductDetailsComponent } from 'src/app/shared/fallback-ui/empty-product-details.component';
import { GoBackButtonComponent } from 'src/app/shared/go-back-button.component';
import { QuantitySelectorComponent } from 'src/app/shared/quantity-selector.component';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { ProductDetailSkeletonComponent } from './product-detail-skeleton.component';
import { ProductDetailService } from './product-detail.service';
import { ProductImageGalleryComponent } from './product-image-gallery.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    KeyValuePipe,
    HlmButtonDirective,
    HlmCardDirective,
    QuantitySelectorComponent,
    ProductDetailSkeletonComponent,
    GoBackButtonComponent,
    ProductImageGalleryComponent,
    EmptyProductDetailsComponent,
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
            <div>
              @for (
                variation of product()!.variations | keyvalue;
                track $index
              ) {
                <p class="mb-2 font-bold">{{ variation.key }}</p>
                <div class="mb-2 flex gap-2">
                  @for (value of variation.value; track $index) {
                    <button
                      hlmBtn
                      size="sm"
                      (click)="changeVariation(variation.key, value)"
                    >
                      {{ value }}
                    </button>
                  }
                </div>
              }
            </div>
            @if (currentItem()) {
              <div class="mb-4 text-xl font-semibold">
                Price:
                {{ currentItem()!.price | currency: product()!.currency }}
              </div>
              <div class="mb-4">
                Stock:
                {{
                  currentItem()!.stock > 0
                    ? currentItem()!.stock
                    : 'Out of stock'
                }}
              </div>

              <app-quantity-selector
                [(quantity)]="itemState().quantity"
                [stock]="currentItem()!.stock"
                class="mb-4"
              />

              <button
                hlmBtn
                [disabled]="
                  currentItem()!.stock <= 0 || itemState().quantity() <= 0
                "
                (click)="addToCart()"
              >
                Add to Cart
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="flex items-center justify-center">
          <app-empty-product-details />
        </div>
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

  protected product = this.productDetailService.product;
  protected currentItem = this.productDetailService.currentItem;
  protected isLoading = this.productDetailService.isLoading;

  protected itemState = computed(() => ({
    currentItem: this.currentItem(),
    quantity: signal(0),
  }));

  protected addToCart(): void {
    const product = this.product()!;
    const currentItem = this.currentItem()!;
    const quantity = this.itemState().quantity();

    this.shoppingCartService.addToCart({
      name: product.name,
      description: product.description,
      currency: product.currency,
      imagePath: product.imagePath,
      placeholder: product.placeholder,
      sku: currentItem.sku,
      stock: currentItem.stock,
      price: currentItem.price,
      variations: currentItem.variations,
      productId: product.id,
      quantity: quantity,
    });
  }

  protected changeVariation(key: string, value: string): void {
    this.productDetailService.updateProductVariation(key, value);
  }
}
