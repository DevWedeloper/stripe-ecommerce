import { InputSignal } from '@angular/core';
import { OrderWithItems } from 'src/db/types';

export type BaseOrderCard = {
  order: InputSignal<OrderWithItems>;
};
