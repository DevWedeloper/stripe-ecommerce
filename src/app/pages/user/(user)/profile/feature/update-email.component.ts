import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { filter } from 'rxjs';
import { emailField } from 'src/app/shared/utils/form';
import { disableTemporarilyStream } from 'src/app/shared/utils/rxjs';
import { UpdateEmailService } from '../data-access/update-email.service';
import { UpdateEmailFormComponent } from '../ui/update-email-form.component';

@Component({
  selector: 'app-update-email',
  standalone: true,
  imports: [UpdateEmailFormComponent],
  template: `
    <app-update-email-form
      [form]="form"
      [isLoading]="isLoading()"
      [disableTemporarily]="disableTemporarily()"
      (submitChange)="onSubmit()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateEmailComponent {
  private fb = inject(FormBuilder);
  private updateEmailService = inject(UpdateEmailService);

  private success$ = this.updateEmailService.updateEmailSuccessWithData$;
  protected isLoading = this.updateEmailService.isLoading;
  private error$ = this.updateEmailService.error$;

  private updateEmailForm = viewChild.required(UpdateEmailFormComponent);

  protected form = this.fb.nonNullable.group({
    ...emailField,
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
      .subscribe(() => this.updateEmailForm().formDir().resetForm());
  }

  protected onSubmit(): void {
    this.updateEmailService.updateEmail(this.form.getRawValue());
  }
}
