import { RouteMeta } from '@analogjs/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { filter } from 'rxjs';
import {
  confirmPasswordField,
  passwordWithValidationField,
} from 'src/app/shared/utils/form';
import { metaWith } from 'src/app/shared/utils/meta';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { passwordShouldMatch } from 'src/app/shared/validators';
import { isAuthenticatedGuard } from '../../../shared/guards/is-authenticated.guard';
import { ResetPasswordService } from './data-access/reset-password.service';
import { ResetPasswordFormComponent } from './ui/reset-password-form-component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Reset Password',
    'Create a new password to secure your account.',
  ),
  title: 'Stripe Ecommerce | Reset Password',
  canActivate: [isAuthenticatedGuard],
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    HlmCardDirective,
    ResetPasswordFormComponent,
  ],
  host: {
    class: 'flex flex-col',
  },
  template: `
    <div hlmCard class="flex flex-col gap-4 rounded-lg border p-4">
      <h1 class="text-center text-lg font-bold">Reset Password</h1>
      <app-reset-password-form
        [form]="form"
        [isLoading]="isLoading()"
        [disable]="disable()"
        (submitChange)="onSubmit()"
      />
    </div>
    <p class="self-end">
      Go back to
      <a hlmBtn variant="link" class="h-auto p-0 text-base" routerLink="/">
        Home
      </a>
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPasswordPageComponent {
  private fb = inject(FormBuilder);

  private resetPasswordService = inject(ResetPasswordService);

  protected isLoading = this.resetPasswordService.isLoading;
  private error$ = this.resetPasswordService.error$;

  protected form = this.fb.nonNullable.group(
    {
      ...passwordWithValidationField,
      ...confirmPasswordField,
    },
    {
      validators: [passwordShouldMatch],
    },
  );

  private disable$ = toggleDisableStream({
    enable: this.form.events.pipe(
      filter((event) => event instanceof ValueChangeEvent),
    ),
    disable: this.error$,
  });

  protected disable = toSignal(this.disable$, {
    initialValue: false,
  });

  protected onSubmit(): void {
    this.resetPasswordService.resetPassword(this.form.getRawValue());
  }
}
