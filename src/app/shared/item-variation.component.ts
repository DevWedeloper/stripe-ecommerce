import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VariationObject } from 'src/db/types';

@Component({
  selector: 'app-item-variation',
  standalone: true,
  host: {
    class: 'flex flex-col gap-1',
  },
  template: `
    @for (variation of variations(); track $index) {
      <span class="text-xs text-muted-foreground">
        {{ variation.name }}: {{ variation.value }}
      </span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemVariationComponent {
  variations = input.required<VariationObject[]>();
}
