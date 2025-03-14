import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePen } from '@ng-icons/lucide';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { AddressAndReceiverData } from 'src/db/types';

@Component({
  selector: 'app-address-card-checkout',
  imports: [NgIcon, HlmIconDirective],
  providers: [provideIcons({ lucidePen })],
  host: {
    class: 'relative flex w-full flex-col gap-2 p-4',
  },
  hostDirectives: [{ directive: HlmCardDirective }],
  template: `
    <p class="text-lg font-semibold">{{ address().fullName }}</p>
    <p class="text-base font-normal">{{ address().addressLine1 }}</p>
    <p class="text-base font-normal">{{ address().addressLine2 }}</p>
    <p class="text-base font-light">
      {{ address().city }}, {{ address().state }}, {{ address().postalCode }},
      {{ countryCode() }}
    </p>

    <div class="absolute right-4 top-4">
      <button
        hlmBtn
        class="h-6 w-6 rounded-full p-0"
        (click)="editChange.emit()"
      >
        <ng-icon hlm size="sm" name="lucidePen" />
        <span class="sr-only">Edit address</span>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressCardCheckoutComponent {
  address = input.required<AddressAndReceiverData>();
  countryCode = input.required<string>();
  editChange = output<void>();
}
