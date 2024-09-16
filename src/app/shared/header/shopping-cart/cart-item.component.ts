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
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { ProductWithQuantity } from '../../shopping-cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgOptimizedImage,
    HlmButtonDirective,
    HlmIconComponent,
  ],
  providers: [provideIcons({ lucideTrash2 })],
  host: {
    class: 'mb-2 block',
  },
  template: `
    <div class="mb-2 flex items-center">
      <div class="relative mr-2 h-16 w-16 rounded-md">
        <img
          [ngSrc]="product().imagePath!"
          [alt]="product().name"
          class="object-cover"
          [placeholder]="product().placeholder!"
          fill
        />
      </div>
      <div class="flex-1">
        <h4 class="text-lg font-semibold">{{ product().name }}</h4>
        <p class="text-sm">{{ product().description }}</p>
        <p class="text-sm font-semibold">
          {{ product().price | currency: product().currency }} x
          {{ product().quantity }}
        </p>
      </div>
    </div>
    <button
      hlmBtn
      variant="destructive"
      class="w-full"
      (click)="removeFromCartChange.emit()"
    >
      <hlm-icon size="sm" class="mr-2" name="lucideTrash2" />
      Remove
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  product = input.required<ProductWithQuantity>();
  removeFromCartChange = output();
}
