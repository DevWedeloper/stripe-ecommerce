import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { ChangeAddressComponent } from './change-address.component';

@Component({
  selector: 'app-change-address-button',
  imports: [HlmButtonDirective],
  template: `
    <button hlmBtn (click)="onClick()">Change</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeAddressButtonComponent {
  private _hlmDialogService = inject(HlmDialogService);

  protected onClick(): void {
    this._hlmDialogService.open(ChangeAddressComponent, {
      contentClass: 'flex',
    });
  }
}
