import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BrnDialogRef } from '@spartan-ng/ui-dialog-brain';
import { take } from 'rxjs';
import { matchPhrase } from 'src/app/shared/validators';
import { ConfirmDeleteFormComponent } from '../ui/confirm-delete-form.component';
import { DeleteUserService } from '../data-access/delete-user.service';

@Component({
  selector: 'app-confirm-delete-account',
  standalone: true,
  imports: [ConfirmDeleteFormComponent],
  host: {
    class: 'w-[425px]',
  },
  template: `
    <app-confirm-delete-form
      [form]="form"
      [isLoading]="isLoading()"
      (cancelChange)="cancel()"
      (confirmChange)="confirm()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeleteAccountComponent {
  private fb = inject(FormBuilder);
  private _dialogRef = inject(BrnDialogRef);
  private deleteUserService = inject(DeleteUserService);

  protected isLoading = this.deleteUserService.isLoading;

  protected form = this.fb.nonNullable.group({
    confirm: ['', [Validators.required, matchPhrase('DELETE')]],
  });

  constructor() {
    this.deleteUserService.deleteUserSuccessWithData$
      .pipe(take(1))
      .subscribe(() => this._dialogRef.close());
  }

  protected cancel(): void {
    this._dialogRef.close();
  }

  protected confirm(): void {
    this.deleteUserService.deleteUser();
  }
}
