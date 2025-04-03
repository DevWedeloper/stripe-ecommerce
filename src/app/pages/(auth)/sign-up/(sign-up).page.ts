import { RouteMeta } from '@analogjs/router';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ValueChangeEvent } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { filter } from 'rxjs';
import {
  confirmPasswordField,
  emailField,
  passwordWithValidationField,
} from 'src/app/shared/utils/form';
import { metaWith } from 'src/app/shared/utils/meta';
import { toggleDisableStream } from 'src/app/shared/utils/rxjs';
import { passwordShouldMatch } from 'src/app/shared/validators';
import { isNotAuthenticatedGuard } from '../../../shared/guards/is-not-authenticated.guard';
import { SignUpService } from './data-access/sign-up.service';
import { SignUpFormComponent } from './ui/sign-up-form.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Sign Up',
    'Create an account to get started.',
  ),
  title: 'Stripe Ecommerce | Sign Up',
  canActivate: [isNotAuthenticatedGuard],
};

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    HlmCardDirective,
    SignUpFormComponent,
  ],
  host: {
    class: 'flex flex-col',
  },
  template: `
    <div hlmCard class="flex flex-col gap-4 rounded-lg border p-4">
      <h1 class="text-center text-lg font-bold">Sign-Up</h1>
      <app-sign-up-form
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
export default class SignUpPageComponent {
  private fb = inject(FormBuilder);
  private signUpService = inject(SignUpService);

  private success$ = this.signUpService.signUpSuccessWithData$;
  protected isLoading = this.signUpService.isLoading;
  private error$ = this.signUpService.error$;

  private signUpForm = viewChild.required(SignUpFormComponent);

  protected form = this.fb.nonNullable.group(
    {
      ...emailField,
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

  constructor() {
    this.success$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.signUpForm().formDir().resetForm());
  }

  protected onSubmit(): void {
    this.signUpService.signUp(this.form.getRawValue());
  }
}
