import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { HlmErrorDirective } from '@spartan-ng/ui-formfield-helm';
import { ErrorMessagePipe } from 'src/app/shared/dynamic-form-errors/error-message.pipe';

@Component({
  selector: 'app-auth-input-error',
  standalone: true,
  imports: [KeyValuePipe, ErrorMessagePipe, HlmErrorDirective],
  host: {
    class: 'block',
  },
  template: `
    @for (error of errors() | keyvalue; track $index) {
      <hlm-error>
        {{ error.key | errorMessage: error.value }}
      </hlm-error>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthInputErrorComponent {
  errors = input<ValidationErrors | undefined | null>(null);
}
