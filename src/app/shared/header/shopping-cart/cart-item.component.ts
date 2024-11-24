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
import { CartItem } from '../../data-access/shopping-cart.service';
import { ItemVariationComponent } from '../../ui/item-variation.component';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgOptimizedImage,
    HlmButtonDirective,
    HlmIconComponent,
    ItemVariationComponent,
  ],
  providers: [provideIcons({ lucideTrash2 })],
  host: {
    class: 'mb-2 block',
  },
  template: `
    <div class="mb-2 flex items-center">
      <div class="relative mr-2 h-16 w-16 rounded-md">
        <img
          [ngSrc]="item().imagePath!"
          [alt]="item().name"
          class="object-cover"
          [placeholder]="item().placeholder!"
          fill
        />
      </div>
      <div class="flex-1">
        <h4 class="text-lg font-semibold">{{ item().name }}</h4>
        <app-item-variation [variations]="item().variations" />
        <p class="text-sm">{{ item().description }}</p>
        <p class="text-sm font-semibold">
          {{ item().price | currency: item().currency }} x
          {{ item().quantity }}
        </p>
      </div>
    </div>
    <button
      hlmBtn
      variant="destructive"
      class="w-full"
      (click)="removeFromCartChange.emit()"
      [disabled]="!isEditable()"
    >
      <hlm-icon size="sm" class="mr-2" name="lucideTrash2" />
      Remove
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  item = input.required<CartItem>();
  isEditable = input.required<boolean>();
  removeFromCartChange = output();
}
