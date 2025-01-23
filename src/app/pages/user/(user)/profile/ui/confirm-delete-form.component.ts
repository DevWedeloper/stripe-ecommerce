import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import { HlmFormFieldComponent } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import { HlmButtonWithLoadingComponent } from 'src/app/shared/ui/hlm-button-with-loading.component';

@Component({
  selector: 'app-confirm-delete-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmLabelDirective,
    HlmInputDirective,
    HlmFormFieldComponent,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmButtonWithLoadingComponent,
  ],
  template: `
    <hlm-dialog-header>
      <h3 hlmDialogTitle>Delete your account</h3>
      <p hlmDialogDescription>
        Are you sure you want to delete your account? This action cannot be
        undone.
      </p>
    </hlm-dialog-header>

    <form [formGroup]="form()" (ngSubmit)="confirm()" class="mt-2">
      <hlm-form-field>
        <label hlmLabel for="confirm">Type "DELETE" to confirm</label>
        <input
          hlmInput
          formControlName="confirm"
          id="confirm"
          type="confirm"
          class="w-full"
        />
      </hlm-form-field>

      <hlm-dialog-footer class="mt-4">
        <button hlmBtn type="button" (click)="cancel()">Cancel</button>
        <button
          hlmBtnWithLoading
          variant="destructive"
          type="submit"
          [disabled]="form().invalid || isLoading()"
          [isLoading]="isLoading()"
        >
          Confirm
        </button>
      </hlm-dialog-footer>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeleteFormComponent {
  form = input.required<FormGroup>();
  isLoading = input.required<boolean>();
  cancelChange = output<void>();
  confirmChange = output<void>();

  protected cancel(): void {
    this.cancelChange.emit();
  }

  protected confirm(): void {
    this.confirmChange.emit();
  }
}
