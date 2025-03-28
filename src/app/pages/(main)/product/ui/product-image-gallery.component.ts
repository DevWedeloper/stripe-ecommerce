import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCarouselImports } from '@spartan-ng/ui-carousel-helm';
import { ImageObject } from 'src/db/types';

@Component({
  selector: 'app-product-image-gallery',
  standalone: true,
  imports: [NgOptimizedImage, HlmCarouselImports],
  host: {
    class: 'block h-full',
  },
  template: `
    <div class="flex w-full items-center justify-center px-8">
      <hlm-carousel class="w-full">
        <hlm-carousel-content>
          @for (imageObject of imageObjects(); track $index) {
            <hlm-carousel-item>
              <div class="relative h-[600px] w-full">
                <img
                  [ngSrc]="imageObject.imagePath"
                  [alt]="alt()"
                  [placeholder]="imageObject.imagePath"
                  class="rounded-lg object-cover"
                  fill
                />
              </div>
            </hlm-carousel-item>
          }
        </hlm-carousel-content>
        <button hlm-carousel-previous></button>
        <button hlm-carousel-next></button>
      </hlm-carousel>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImageGalleryComponent {
  imageObjects = input.required<ImageObject[]>();
  alt = input.required<string>();
}
