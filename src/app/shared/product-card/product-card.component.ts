import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { ProductsWithThumbnail } from 'src/db/types';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgOptimizedImage, HlmCardDirective],
  host: {
    class: 'flex w-full justify-center',
  },
  template: `
    <a
      hlmCard
      class="flex h-full max-w-sm flex-col overflow-hidden rounded-lg border-2 border-border bg-background transition delay-150 ease-in-out hover:scale-105"
      [routerLink]="'/products/' + product().id"
    >
      <div class="relative h-48 w-full">
        <img
          [ngSrc]="product().imagePath!"
          [alt]="product().name"
          class="object-cover"
          [placeholder]="product().placeholder!"
          fill
        />
      </div>
      <div class="flex grow flex-col p-4">
        <h2 class="mb-2 text-xl font-semibold">{{ product().name }}</h2>
        <p class="mb-4">{{ product().description }}</p>
        <div class="mb-2 mt-auto flex items-center justify-between">
          <span class="text-lg font-bold">
            {{ product().price | currency: product().currency }}
          </span>
          <span class="text-sm">In Stock: {{ product().stock }}</span>
        </div>
        <div class="text-sm">{{ product().currency }}</div>
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product = input.required<ProductsWithThumbnail>();
}
