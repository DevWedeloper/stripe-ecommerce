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
import { ItemVariationComponent } from 'src/app/shared/item-variation.component';
import { QuantitySelectorComponent } from 'src/app/shared/ui/quantity-selector.component';
import { CartItem } from 'src/app/shared/shopping-cart.service';

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
    ItemVariationComponent,
  ],
  providers: [provideIcons({ lucideTrash2 })],
  template: `
    <div hlmCard class="relative grid h-32 grid-cols-3 p-4">
      <div
        class="relative col-span-1 flex h-16 w-16 items-center justify-center rounded"
      >
        <img
          [ngSrc]="item().imagePath!"
          [alt]="item().name"
          class="object-cover"
          [placeholder]="item().placeholder!"
          fill
        />
      </div>

      <div class="col-span-2 flex flex-col justify-between">
        <h2 class="text-xl font-semibold">{{ item().name }}</h2>
        <app-item-variation [variations]="item().variations" />
        <div class="flex items-center justify-between">
          <p class="text-lg font-semibold">
            {{ item().price * item().quantity | currency: item().currency }}
          </p>
          <app-quantity-selector
            [quantity]="item().quantity"
            [stock]="item().stock"
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
  item = input.required<CartItem>();
  isEditable = input.required<boolean>();
  quantityChange = output<number>();
  removeFromCartChange = output<void>();
}
