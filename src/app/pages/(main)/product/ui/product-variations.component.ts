import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { VariationSchema } from 'src/schemas/product';

@Component({
  selector: 'app-product-variations',
  standalone: true,
  imports: [HlmButtonDirective],
  template: `
    @for (variation of variations(); track $index) {
      <p class="mb-2 font-bold">{{ variation.variation }}</p>
      <div class="mb-2 flex gap-2">
        @for (value of variation.options; track $index) {
          <button
            hlmBtn
            size="sm"
            (click)="onClick(variation.variation, value.value)"
          >
            {{ value.value }}
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariationsComponent {
  variations = input.required<VariationSchema[]>();
  variationChange = output<{ key: string; value: string }>();

  protected onClick(key: string, value: string): void {
    this.variationChange.emit({ key, value });
  }
}
