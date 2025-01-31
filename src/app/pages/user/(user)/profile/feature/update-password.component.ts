import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { filter } from 'rxjs';
import {
  confirmPasswordField,
  passwordWithValidationField,
} from 'src/app/shared/utils/form';
import { disableTemporarilyStream } from 'src/app/shared/utils/rxjs';
import { UpdatePasswordService } from '../data-access/update-password.service';
import { UpdatePasswordFormComponent } from '../ui/update-password-form.component';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [UpdatePasswordFormComponent],
  template: `
    <app-update-password-form
      [form]="form"
      [isLoading]="isLoading()"
      [disableTemporarily]="disableTemporarily()"
      (submitChange)="onSubmit()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePasswordComponent {
  private fb = inject(FormBuilder);
  private updatePasswordService = inject(UpdatePasswordService);

  private success$ = this.updatePasswordService.updatePasswordSuccessWithData$;
  protected isLoading = this.updatePasswordService.isLoading;
  private error$ = this.updatePasswordService.error$;

  private updatePasswordForm = viewChild.required(UpdatePasswordFormComponent);

  protected form = this.fb.nonNullable.group({
    ...passwordWithValidationField,
    ...confirmPasswordField,
  });

  private disableTemporarily$ = disableTemporarilyStream({
    enable: this.form.events.pipe(
      filter((event) => event instanceof ValueChangeEvent),
    ),
    disable: this.error$,
  });

  protected disableTemporarily = toSignal(this.disableTemporarily$, {
    initialValue: false,
  });

  constructor() {
    this.success$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updatePasswordForm().formDir().resetForm());
  }

  protected onSubmit(): void {
    this.updatePasswordService.updatePassword(this.form.getRawValue());
  }
}
