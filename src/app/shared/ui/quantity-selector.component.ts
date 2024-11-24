import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideMinus, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { hlm } from '@spartan-ng/ui-core';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { ClassValue } from 'clsx';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent],
  providers: [provideIcons({ lucidePlus, lucideMinus })],
  host: {
    '[class]': 'computedClass()',
  },
  template: `
    <button
      hlmBtn
      (click)="subtractQuantity()"
      [disabled]="quantity() <= 1"
      class="h-6 w-6 rounded-full p-0"
    >
      <hlm-icon size="sm" name="lucideMinus" />
    </button>
    <span class="text-lg">{{ quantity() }}</span>
    <button
      hlmBtn
      (click)="addQuantity()"
      [disabled]="quantity() >= stock()"
      class="h-6 w-6 rounded-full p-0"
    >
      <hlm-icon size="sm" name="lucidePlus" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantitySelectorComponent {
  quantity = model.required<number>();
  stock = input.required<number>();
  userClass = input<ClassValue>('', { alias: 'class' });

  protected computedClass = computed(() =>
    hlm('flex items-center gap-2', this.userClass()),
  );

  protected addQuantity(): void {
    if (this.quantity() < this.stock()) {
      this.quantity.update((q) => q + 1);
    }
  }

  protected subtractQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }
}