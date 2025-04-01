import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmDialogService } from '@spartan-ng/ui-dialog-helm';
import { ConfirmDeleteAccountDialogComponent } from './confirm-delete-account-dialog.component';

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [HlmButtonDirective, ...HlmCardImports],
  template: `
    <div hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Delete your account</h3>
        <p hlmCardDescription>
          Permanently remove your account and all associated data.
        </p>
      </div>

      <div hlmCardFooter class="flex justify-end">
        <button hlmBtn variant="destructive" (click)="onClick()">
          Delete account
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteUserComponent {
  private _hlmDialogService = inject(HlmDialogService);

  protected onClick(): void {
    this._hlmDialogService.open(ConfirmDeleteAccountDialogComponent, {
      contentClass: 'flex',
    });
  }
}
