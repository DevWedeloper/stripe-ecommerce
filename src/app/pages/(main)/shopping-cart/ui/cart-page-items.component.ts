import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { CartItem } from 'src/app/shared/types/cart';
import { ItemVariationComponent } from 'src/app/shared/ui/item-variation.component';
import { QuantitySelectorComponent } from 'src/app/shared/ui/quantity-selector.component';

@Component({
  selector: 'app-cart-page-items',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgOptimizedImage,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
    HlmCardDirective,
    QuantitySelectorComponent,
    ItemVariationComponent,
  ],
  providers: [provideIcons({ lucideTrash2 })],
  template: `
    <div hlmCard class="grid grid-cols-4 items-center p-4">
      <div class="relative flex h-16 w-16 justify-center rounded">
        <img
          [ngSrc]="item().imagePath!"
          [alt]="item().name"
          class="object-cover"
          [placeholder]="item().placeholder!"
          fill
        />
      </div>

      <div class="flex flex-col">
        <h2 class="text-lg font-semibold">{{ item().name }}</h2>
        <p>{{ item().description }}</p>
        <app-item-variation [variations]="item().variations" />
      </div>

      <div class="flex items-center justify-center gap-2">
        <app-quantity-selector
          [quantity]="item().quantity"
          [stock]="item().stock"
          (quantityChange)="quantityChange.emit($event)"
        />
      </div>

      <div class="flex flex-col items-center justify-end gap-4">
        <span class="text-2xl font-semibold">
          {{ item().price * item().quantity | currency: 'USD' }}
        </span>
        <button
          hlmBtn
          variant="destructive"
          (click)="removeFromCartChange.emit()"
          class="flex items-center gap-2"
          [disabled]="!isEditable()"
        >
          <ng-icon hlm size="sm" name="lucideTrash2" />
          <span>Remove</span>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPageItemsComponent {
  item = input.required<CartItem>();
  isEditable = input.required<boolean>();
  quantityChange = output<number>();
  removeFromCartChange = output<void>();
}
