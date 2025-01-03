import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucidePen, lucideTrash2 } from '@ng-icons/lucide';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/ui/hlm-button-with-loading.component';
import { AddressAndReceiverData } from 'src/db/types';

@Component({
  selector: 'app-address-card',
  imports: [HlmIconComponent, HlmButtonWithLoadingComponent],
  providers: [provideIcons({ lucidePen, lucideTrash2 })],
  host: {
    class: 'relative flex flex-col gap-2 p-4',
  },
  hostDirectives: [{ directive: HlmCardDirective }],
  template: `
    <p class="text-lg font-semibold">{{ address().fullName }}</p>
    <p class="text-base font-normal">{{ address().addressLine1 }}</p>
    <p class="text-base font-normal">{{ address().addressLine2 }}</p>
    <p class="text-base font-light">
      {{ address().city }}, {{ address().state }}, {{ address().postalCode }},
      {{ address().countryCode }}
    </p>
    <div class="absolute right-4 top-4 flex flex-col gap-2">
      <div class="flex gap-2 self-end">
        <button
          hlmBtn
          class="h-6 w-6 rounded-full p-0"
          (click)="editChange.emit()"
        >
          <hlm-icon size="sm" name="lucidePen" />
          <span class="sr-only">Edit address</span>
        </button>
        @if (!address().isDefault) {
          <button
            hlmBtn
            class="h-6 w-6 rounded-full p-0"
            (click)="deleteChange.emit()"
            [disabled]="isDeleteLoading()"
          >
            <hlm-icon size="sm" name="lucideTrash2" />
            <span class="sr-only">Delete address</span>
          </button>
        }
      </div>
      <button
        hlmBtnWithLoading
        variant="outline"
        size="sm"
        [disabled]="address().isDefault || isSetDefaultLoading()"
        [isLoading]="isSetDefaultLoading()"
        (click)="setAsDefaultChange.emit()"
      >
        Set as Default
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressCardComponent {
  address = input.required<AddressAndReceiverData>();
  isSetDefaultLoading = input.required<boolean>();
  isDeleteLoading = input.required<boolean>();
  editChange = output<void>();
  deleteChange = output<void>();
  setAsDefaultChange = output<void>();
}
