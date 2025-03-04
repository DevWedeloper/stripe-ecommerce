import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import {
  authInputErrorProvider,
  sharedFormDeps,
} from 'src/app/shared/utils/form';

@Component({
  selector: 'app-update-email-form',
  standalone: true,
  imports: [...HlmCardImports, ...sharedFormDeps],
  providers: [authInputErrorProvider],
  template: `
    <div hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Update your email</h3>
        <p hlmCardDescription>
          Update your email address to keep your account information current.
        </p>
      </div>

      <form [formGroup]="form()" (ngSubmit)="onSubmit()">
        <div hlmCardContent class="flex flex-col gap-4">
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
export class UpdateEmailFormComponent {
  form = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  disable = input.required<boolean>();
  submitChange = output<void>();

  formDir = viewChild.required(FormGroupDirective);

  protected onSubmit(): void {
    this.submitChange.emit();
  }
}
