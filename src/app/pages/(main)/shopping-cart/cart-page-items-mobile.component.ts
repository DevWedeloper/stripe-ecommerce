import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { QuantitySelectorComponent } from 'src/app/shared/quantity-selector.component';
import { ProductWithQuantity } from 'src/app/shared/shopping-cart.service';

@Component({
  selector: 'app-cart-page-items-mobile',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgOptimizedImage,
    HlmButtonDirective,
    HlmIconComponent,
    HlmCardDirective,
    QuantitySelectorComponent,
  ],
  providers: [provideIcons({ lucideTrash2 })],
  template: `
    <div hlmCard class="relative grid h-32 grid-cols-3 p-4">
      <div
        class="relative col-span-1 flex h-16 w-16 items-center justify-center rounded"
      >
        <img
          [ngSrc]="product().imagePath!"
          [alt]="product().name"
          class="object-cover"
          [placeholder]="product().placeholder!"
          fill
        />
      </div>

      <div class="col-span-2 flex flex-col justify-between">
        <h2 class="text-xl font-semibold">{{ product().name }}</h2>
        <div class="flex items-center justify-between">
          <p class="text-lg font-semibold">
            {{
              product().price * product().quantity
                | currency: product().currency
            }}
          </p>
          <app-quantity-selector
            [quantity]="product().quantity"
            [stock]="product().stock"
            (quantityChange)="quantityChange.emit($event)"
          />
        </div>
      </div>

      <button
        hlmBtn
        variant="destructive"
        size="sm"
        (click)="removeFromCartChange.emit()"
        class="absolute right-2 top-2"
        [disabled]="!isEditable()"
      >
        <hlm-icon size="xs" name="lucideTrash2" />
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPageItemsMobileComponent {
  product = input.required<ProductWithQuantity>();
  isEditable = input.required<boolean>();
  quantityChange = output<number>();
  removeFromCartChange = output<void>();
}
