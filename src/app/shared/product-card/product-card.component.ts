import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { Products } from 'src/db/schema';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, HlmCardDirective],
  template: `
    <a
      hlmCard
      class="mx-auto block max-w-sm overflow-hidden rounded-lg border-2 border-border bg-background transition delay-150 ease-in-out hover:scale-105"
      [routerLink]="'/products/' + product().id"
    >
      <img
        [src]="s3Url + '/' + product().imagePath"
        [alt]="product().name"
        class="h-48 w-full object-cover"
      />
      <div class="p-4">
        <h2 class="mb-2 text-xl font-semibold">{{ product().name }}</h2>
        <p class="mb-4">{{ product().description }}</p>
        <div class="mb-2 flex items-center justify-between">
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
  product = input.required<Products>();

  protected s3Url = environment.s3Url;
}