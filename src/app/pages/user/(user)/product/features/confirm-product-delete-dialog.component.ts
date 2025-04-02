import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { take } from 'rxjs';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/ui/hlm-button-with-loading.component';
import { DeleteProductService } from '../data-access/delete-product.service';

@Component({
  selector: 'app-confirm-product-delete-dialog',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmButtonWithLoadingComponent,
  ],
  host: {
    class: 'w-[425px]',
  },
  template: `
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Confirm Product Deletion</h3>
      <p hlmDialogDescription>
        Are you sure you want to delete this product? Some product data will be
        retained for audit purposes.
      </p>
    </hlm-dialog-header>
    <hlm-dialog-footer class="mt-2">
      <button hlmBtn (click)="cancel()">Cancel</button>
      <button
        hlmBtnWithLoading
        variant="destructive"
        [disabled]="isLoading()"
        [isLoading]="isLoading()"
        (click)="confirm()"
      >
        Confirm
      </button>
    </hlm-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmProductDeleteDialogComponent {
  private _dialogRef = inject(BrnDialogRef);
  private _dialogContext = injectBrnDialogContext<{ productId: number }>();
  private deleteProductService = inject(DeleteProductService);

  private productId = this._dialogContext.productId;

  protected isLoading = this.deleteProductService.isLoading;

  constructor() {
    this.deleteProductService.deleteProductSuccessWithData$
      .pipe(take(1))
      .subscribe(() => this._dialogRef.close());
  }

  protected cancel(): void {
    this._dialogRef.close(false);
  }

  protected confirm(): void {
    this.deleteProductService.deleteProduct(this.productId);
  }
}
