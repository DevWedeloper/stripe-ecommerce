import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { BrnDialogRef } from '@spartan-ng/ui-dialog-brain';
import {
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { ShoppingCartService } from 'src/app/shared/data-access/shopping-cart.service';

@Component({
  selector: 'app-confirm-navigation',
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
export class ConfirmNavigationComponent {
  private _dialogRef = inject(BrnDialogRef);
  private shoppingCartService = inject(ShoppingCartService);

  protected cancel(): void {
    this._dialogRef.close(false);
  }

  protected forward(): void {
    this._dialogRef.close(true);
    this.shoppingCartService.setEditable(true);
  }
}
