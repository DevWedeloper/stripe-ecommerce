import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { ShoppingCartService } from 'src/app/shared/data-access/shopping-cart.service';
import { EmptyProductDetailsComponent } from 'src/app/shared/ui/fallback/empty-product-details.component';
import { GoBackButtonComponent } from 'src/app/shared/ui/go-back-button.component';
import { ProductDetailService } from './data-access/product-detail.service';
import { ProductDetailSkeletonComponent } from './ui/product-detail-skeleton.component';
import { ProductImageGalleryComponent } from './ui/product-image-gallery.component';
import { ProductPricingDetailsComponent } from './ui/product-pricing-details.component';
import { ProductVariationsComponent } from './ui/product-variations.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    HlmCardDirective,
    ProductDetailSkeletonComponent,
    GoBackButtonComponent,
    ProductImageGalleryComponent,
    EmptyProductDetailsComponent,
    ProductVariationsComponent,
    ProductPricingDetailsComponent,
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
            <app-product-variations
              [variations]="product()!.variations"
              (variationChange)="changeVariation($event.key, $event.value)"
            />
            @if (currentItem()) {
              <app-product-pricing-details
                [stock]="currentItem()!.stock"
                [price]="currentItem()!.price"
                [currency]="product()!.currency"
                [(quantity)]="itemState().quantity"
                (addToCart)="addToCart()"
              />
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
