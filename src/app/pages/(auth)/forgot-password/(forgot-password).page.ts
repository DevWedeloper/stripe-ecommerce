import { RouteMeta } from '@analogjs/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { filter } from 'rxjs';
import { emailField } from 'src/app/shared/utils/form';
import { metaWith } from 'src/app/shared/utils/meta';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { isNotAuthenticatedGuard } from '../../../shared/guards/is-not-authenticated.guard';
import { ForgotPasswordService } from './data-access/forgot-password.service';
import { ForgotPasswordFormComponent } from './ui/forgot-password-form.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Forgot Password',
    'Enter your email to reset your password and regain access to your account.',
  ),
  title: 'Stripe Ecommerce | Forgot Password',
  canActivate: [isNotAuthenticatedGuard],
};

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    HlmCardDirective,
    ForgotPasswordFormComponent,
  ],
  host: {
    class: 'flex flex-col',
  },
  template: `
    <div hlmCard class="flex flex-col gap-4 rounded-lg border p-4">
      <h1 class="text-center text-lg font-bold">Forgot Password</h1>
      <app-forgot-password-form
        [form]="form"
        [isLoading]="isLoading()"
        [disable]="disable()"
        (submitChange)="onSubmit()"
      />
    </div>
    <div class="flex justify-between">
      <p>
        Go back to
        <a hlmBtn variant="link" class="h-auto p-0 text-base" routerLink="/">
          Home
        </a>
      </p>
      <p>
        Have an account?
        <a
          hlmBtn
          variant="link"
          class="h-auto p-0 text-base"
          routerLink="/login"
        >
          Login
        </a>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgotPasswordPageComponent {
  private fb = inject(FormBuilder);
  private forgotPasswordService = inject(ForgotPasswordService);

  protected isLoading = this.forgotPasswordService.isLoading;
  private error$ = this.forgotPasswordService.error$;

  protected form = this.fb.nonNullable.group({
    ...emailField,
  });

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
    this.forgotPasswordService.forgotPassword(this.form.getRawValue());
  }
}
