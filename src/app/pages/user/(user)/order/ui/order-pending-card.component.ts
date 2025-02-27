import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { OrderWithItems } from 'src/db/types';
import { BaseOrderCard } from '../types/base-order-card';
import { OrderCardBodyComponent } from './order-card-body.component';
import { UpdateStatusComponent } from './update-status.component';

@Component({
  selector: 'app-order-pending-card',
  imports: [OrderCardBodyComponent, HlmButtonDirective, UpdateStatusComponent],
  host: {
    class: 'block p-4',
  },
  hostDirectives: [{ directive: HlmCardDirective }],
  template: `
    <app-order-card-body [items]="order().items" [total]="order().total" />
    <div class="mt-4 flex items-center justify-end gap-4">
      <app-update-status (updateEmit)="updateEmit.emit(order().id)" />
      <button
        hlmBtn
        variant="destructive"
        (click)="cancelEmit.emit(order().id)"
      >
        Cancel
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderPendingCardComponent implements BaseOrderCard {
  order = input.required<OrderWithItems>();
  updateEmit = output<number>();
  cancelEmit = output<number>();
}
