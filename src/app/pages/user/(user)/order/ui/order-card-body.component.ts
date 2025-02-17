import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { ItemVariationComponent } from 'src/app/shared/ui/item-variation.component';
import { OrderItemWithVariations } from 'src/db/types';

@Component({
  selector: 'app-order-card-body',
  imports: [CurrencyPipe, HlmCardDirective, ItemVariationComponent],
  template: `
    <ul class="flex flex-col gap-2">
      @for (item of items(); track $index) {
        <li hlmCard class="flex justify-between p-4">
          <div>
            <p class="text-xl font-bold">{{ item.name }}</p>
            <app-item-variation [variations]="item.variations" />
            <p class="font-medium">
              <span>x</span>
              {{ item.quantity }}
            </p>
          </div>
          <p class="my-auto font-medium">{{ item.price | currency: 'USD' }}</p>
        </li>
      }
    </ul>

    <p class="mt-4 text-right">
      <span class="font-medium">Total:</span>
      {{ total() | currency: 'USD' }}
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardBodyComponent {
  items = input.required<OrderItemWithVariations[]>();
  total = input.required<number>();
}
