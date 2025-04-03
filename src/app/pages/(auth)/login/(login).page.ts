import { RouteMeta } from '@analogjs/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { filter } from 'rxjs';
import { emailField, passwordField } from 'src/app/shared/utils/form';
import { metaWith } from 'src/app/shared/utils/meta';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { isNotAuthenticatedGuard } from '../../../shared/guards/is-not-authenticated.guard';
import { LoginService } from './data-access/login.service';
import { LoginFormComponent } from './ui/login-form.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Login',
    'Log in to access your account and manage your activities.',
  ),
  title: 'Stripe Ecommerce | Login',
  canActivate: [isNotAuthenticatedGuard],
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    HlmCardDirective,
    LoginFormComponent,
  ],
  host: {
    class: 'flex flex-col',
  },
  template: `
    <div hlmCard class="flex flex-col gap-4 rounded-lg border p-4">
      <h1 class="text-center text-lg font-bold">Login</h1>
      <app-login-form
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
        Don&apos;t have an account?
        <a
          hlmBtn
          variant="link"
          class="h-auto p-0 text-base"
          routerLink="/sign-up"
        >
          Sign-Up
        </a>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPageComponent {
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);

  protected isLoading = this.loginService.isLoading;
  private error$ = this.loginService.error$;

  protected form = this.fb.nonNullable.group({
    ...emailField,
    ...passwordField,
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
    this.loginService.login(this.form.getRawValue());
  }
}
