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

@Component({
  selector: 'app-order-completed-card',
  imports: [OrderCardBodyComponent],
  host: {
    class: 'p-4',
  },
  hostDirectives: [{ directive: HlmCardDirective }],
  template: `
    <app-order-card-body
      [items]="order().items"
      [total]="order().total"
      (writeReview)="writeReview.emit($event)"
      (editReview)="editReview.emit($event)"
      (deleteReview)="deleteReview.emit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCompletedCardComponent implements BaseOrderCard {
  order = input.required<OrderWithItems>();
  writeReview = output<number>();
  editReview = output<number>();
  deleteReview = output<number>();
}
