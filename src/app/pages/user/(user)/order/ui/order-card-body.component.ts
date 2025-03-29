import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash, lucideUserPen } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { ItemVariationComponent } from 'src/app/shared/ui/item-variation.component';
import { OrderItemWithVariations } from 'src/db/types';

@Component({
  selector: 'app-order-card-body',
  imports: [
    CurrencyPipe,
    HlmCardDirective,
    NgIcon,
    HlmIconDirective,
    HlmButtonDirective,
    ItemVariationComponent,
  ],
  providers: [provideIcons({ lucideUserPen, lucidePencil, lucideTrash })],
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
          <div class="flex items-center gap-4">
            @if (item.canReview) {
              <button
                hlmBtn
                size="icon"
                variant="outline"
                (click)="writeReview.emit(item.id)"
              >
                <ng-icon hlm size="sm" name="lucideUserPen" />
                <span class="sr-only">Write a review</span>
              </button>
            }
            @if (item.canEdit) {
              <button
                hlmBtn
                size="icon"
                variant="outline"
                (click)="editReview.emit(item.id)"
              >
                <ng-icon hlm size="sm" name="lucidePencil" />
                <span class="sr-only">Edit review</span>
              </button>
            }
            @if (item.canDelete) {
              <button
                hlmBtn
                size="icon"
                variant="destructive"
                (click)="deleteReview.emit(item.id)"
              >
                <ng-icon hlm size="sm" name="lucideTrash" />
                <span class="sr-only">Delete review</span>
              </button>
            }
            <p class="my-auto font-medium">
              {{ item.price | currency: 'USD' }}
            </p>
          </div>
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
  writeReview = output<number>();
  editReview = output<number>();
  deleteReview = output<number>();
}
