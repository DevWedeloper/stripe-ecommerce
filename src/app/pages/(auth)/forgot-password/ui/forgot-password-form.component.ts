import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  authInputErrorProvider,
  sharedFormDeps,
} from 'src/app/shared/utils/form';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [...sharedFormDeps],
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
export class ForgotPasswordFormComponent {
  form = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  disable = input.required<boolean>();
  submitChange = output<void>();

  protected onSubmit(): void {
    this.submitChange.emit();
  }
}
