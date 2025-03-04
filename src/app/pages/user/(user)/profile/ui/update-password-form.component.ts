import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmHintDirective } from '@spartan-ng/ui-formfield-helm';
import {
  authInputErrorProvider,
  sharedFormDeps,
} from 'src/app/shared/utils/form';

@Component({
  selector: 'app-update-password-form',
  standalone: true,
  imports: [...HlmCardImports, ...sharedFormDeps, HlmHintDirective],
  providers: [authInputErrorProvider],
  template: `
    <div hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Update your password</h3>
        <p hlmCardDescription>
          Secure your account by updating to a strong, unique password.
        </p>
      </div>

      <form [formGroup]="form()" (ngSubmit)="onSubmit()">
        <div hlmCardContent class="flex flex-col gap-4">
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
        </div>

        <div hlmCardFooter class="flex justify-end">
          <button
            hlmBtnWithLoading
            [disabled]="form().invalid || isLoading() || disable()"
            [isLoading]="isLoading()"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePasswordFormComponent {
  form = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  disable = input.required<boolean>();
  submitChange = output<void>();

  formDir = viewChild.required(FormGroupDirective);

  protected onSubmit(): void {
    this.submitChange.emit();
  }
}
