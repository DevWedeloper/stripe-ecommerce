import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { ConfirmProductDeleteDialogComponent } from './confirm-product-delete-dialog.component';

@Component({
  selector: 'app-delete-product',
  imports: [HlmButtonDirective],
  host: {
    class: 'block p-1',
  },
  template: `
    <button hlmBtn variant="destructive" (click)="onClick()" class="w-full">
      Delete Product
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteProductComponent {
  productId = input.required<number>();

  private _hlmDialogService = inject(HlmDialogService);

  protected onClick(): void {
    this._hlmDialogService.open(ConfirmProductDeleteDialogComponent, {
      contentClass: 'flex',
      context: { productId: this.productId() },
    });
  }
}
