import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';

@Component({
  selector: 'app-confirm-navigation-dialog',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
  ],
  host: {
    class: 'w-[425px]',
  },
  template: `
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Confirm Navigation</h3>
      <p hlmDialogDescription>
        Are you sure you want to cancel processing your payment?
      </p>
    </hlm-dialog-header>
    <hlm-dialog-footer class="mt-2">
      <button hlmBtn (click)="cancel()">Cancel</button>
      <button hlmBtn (click)="forward()">Forward</button>
    </hlm-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmNavigationDialogComponent {
  private _dialogRef = inject(BrnDialogRef);

  protected cancel(): void {
    this._dialogRef.close(false);
  }

  protected forward(): void {
    this._dialogRef.close(true);
  }
}
