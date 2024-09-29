import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ErrorMessagePipe } from '../error-message.pipe';

@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [KeyValuePipe, ErrorMessagePipe],
  template: `
    @for (error of errors() | keyvalue; track $index) {
      <div class="text-destructive">
        {{ error.key | errorMessage: error.value }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputErrorComponent {
  errors = input<ValidationErrors | undefined | null>(null);
}
