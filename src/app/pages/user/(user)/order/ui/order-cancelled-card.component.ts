import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { OrderWithItems } from 'src/db/types';
import { BaseOrderCard } from '../types/base-order-card';
import { OrderCardBodyComponent } from './order-card-body.component';

@Component({
  selector: 'app-order-cancelled-card',
  imports: [OrderCardBodyComponent],
  host: {
    class: 'p-4',
  },
  hostDirectives: [{ directive: HlmCardDirective }],
  template: `
    <app-order-card-body [items]="order().items" [total]="order().total" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCancelledCardComponent implements BaseOrderCard {
  order = input.required<OrderWithItems>();
}
