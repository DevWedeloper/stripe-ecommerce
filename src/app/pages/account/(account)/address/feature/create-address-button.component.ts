import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { CreateAddressComponent } from './create-address.component';

@Component({
  selector: 'app-create-address-button',
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent, ...HlmCardImports],
  providers: [provideIcons({ lucidePlus })],
  template: `
    <button hlmBtn (click)="onClick()">
      <hlm-icon size="sm" class="mr-2" name="lucidePlus" />
      Add New Address
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAddressButtonComponent {
  private _hlmDialogService = inject(HlmDialogService);

  protected onClick(): void {
    this._hlmDialogService.open(CreateAddressComponent, {
      contentClass: 'flex',
    });
  }
}
