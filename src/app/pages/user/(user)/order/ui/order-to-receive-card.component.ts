import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { OrderWithItems } from 'src/db/types';
import { BaseOrderCard } from '../types/base-order-card';
import { OrderCardBodyComponent } from './order-card-body.component';
import { UpdateStatusComponent } from './update-status.component';

@Component({
  selector: 'app-order-to-receive-card',
  imports: [OrderCardBodyComponent, UpdateStatusComponent],
  host: {
    class: 'p-4',
  },
  hostDirectives: [{ directive: HlmCardDirective }],
  template: `
    <app-order-card-body [items]="order().items" [total]="order().total" />
    <app-update-status
      (updateEmit)="updateEmit.emit(order().id)"
      class="ml-auto mt-4 block w-fit"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderToReceiveCardComponent implements BaseOrderCard {
  order = input.required<OrderWithItems>();
  updateEmit = output<number>();
}
