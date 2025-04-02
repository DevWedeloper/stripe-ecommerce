import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { CreateProductComponent } from './create-product.component';

@Component({
  selector: 'app-create-product-button',
  imports: [HlmButtonDirective],
  template: `
    <button hlmBtn (click)="onClick()">Create</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductButtonComponent {
  private _hlmDialogService = inject(HlmDialogService);

  protected onClick(): void {
    this._hlmDialogService.open(CreateProductComponent, {
      contentClass: 'flex max-w-none',
    });
  }
}
