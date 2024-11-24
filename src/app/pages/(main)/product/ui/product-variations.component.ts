import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'app-product-variations',
  standalone: true,
  imports: [KeyValuePipe, HlmButtonDirective],
  template: `
    @for (variation of variations() | keyvalue; track $index) {
      <p class="mb-2 font-bold">{{ variation.key }}</p>
      <div class="mb-2 flex gap-2">
        @for (value of variation.value; track $index) {
          <button
            hlmBtn
            size="sm"
            (click)="onClick(variation.key, value)"
          >
            {{ value }}
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariationsComponent {
  variations = input.required<Record<string, string[]>>();
  variationChange = output<{ key: string; value: string }>();

  protected onClick(key: string, value: string): void {
    this.variationChange.emit({ key, value });
  }
}
