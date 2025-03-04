import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HlmHintDirective } from '@spartan-ng/ui-formfield-helm';
import {
  authInputErrorProvider,
  sharedFormDeps,
} from 'src/app/shared/utils/form';

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [...sharedFormDeps, HlmHintDirective],
  providers: [authInputErrorProvider],
  template: `
    <form
      [formGroup]="form()"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-4"
    >
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
        <hlm-hint>
          Password must be at least 8 characters and contain at least one
          lowercase letter, one uppercase letter, one digit, and one special
          character.
        </hlm-hint>
      </hlm-form-field>

      <hlm-form-field>
        <label hlmLabel for="confirm-password">Confirm Password</label>
        <input
          hlmInput
          formControlName="confirmPassword"
          id="confirm-password"
          type="password"
          placeholder="Confirm Password"
          class="w-full"
        />
      </hlm-form-field>

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
export class ResetPasswordFormComponent {
  form = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  disable = input.required<boolean>();
  submitChange = output<void>();

  protected onSubmit(): void {
    this.submitChange.emit();
  }
}
