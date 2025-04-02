import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'app-product-images',
  imports: [HlmButtonDirective],
  host: {
    class:
      'flex flex-col gap-4 rounded-lg border-2 border-dashed border-border p-6 text-center',
  },
  template: `
    <input
      type="file"
      (change)="filesSelected.emit($event)"
      multiple
      accept="image/*"
      class="hidden"
      #fileInput
    />
    <button hlmBtn type="button" variant="ghost" (click)="fileInput.click()">
      Select Images
    </button>

    @if (errorMessage()) {
      <p class="mt-2 text-sm text-destructive">
        {{ errorMessage() }}
      </p>
    }

    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImagesComponent {
  errorMessage = input.required<string | null>();
  filesSelected = output<Event>();
}
