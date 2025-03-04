import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  authInputErrorProvider,
  sharedFormDeps,
} from 'src/app/shared/utils/form';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [...sharedFormDeps, RouterLink],
  providers: [authInputErrorProvider],
  template: `
    <form
      [formGroup]="form()"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-4"
    >
      <hlm-form-field>
        <label hlmLabel for="email">Email</label>
        <input
          hlmInput
          formControlName="email"
          id="email"
          type="email"
          placeholder="Email"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-form-field>
        <label hlmLabel for="password">Password</label>
        <input
          hlmInput
          formControlName="password"
          id="password"
          type="password"
          placeholder="Password"
          class="w-full"
        />
      </hlm-form-field>

      <a
        hlmBtn
        variant="link"
        class="h-auto self-start p-0 text-base"
        routerLink="/forgot-password"
      >
        Forgot Password?
      </a>

      <button
        hlmBtnWithLoading
        [disabled]="form().invalid || isLoading() || disable()"
        class="w-full"
        [isLoading]="isLoading()"
      >
        Submit
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  form = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  disable = input.required<boolean>();
  submitChange = output<void>();

  protected onSubmit(): void {
    this.submitChange.emit();
  }
}
