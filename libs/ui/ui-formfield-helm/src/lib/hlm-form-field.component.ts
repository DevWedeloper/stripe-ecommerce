import {
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  type Signal,
} from '@angular/core';

import { BrnFormFieldControl } from '@spartan-ng/ui-formfield-brain';
import { HlmErrorDirective } from './hlm-error.directive';

@Component({
  selector: 'hlm-form-field',
  template: `
    <ng-content></ng-content>

    @switch (hasDisplayedMessage()) {
      @case ('error') {
        <ng-content select="hlm-error"></ng-content>
      }
      @default {
        <ng-content select="hlm-hint"></ng-content>
      }
    }
  `,
  standalone: true,
  host: {
    class: 'space-y-2 block',
  },
})
export class HlmFormFieldComponent {
  control = contentChild(BrnFormFieldControl);

  errorChildren = contentChildren(HlmErrorDirective);

  hasDisplayedMessage: Signal = computed(() => {
    return this.errorChildren() &&
      this.errorChildren().length > 0 &&
      this.control()?.errorState()
      ? 'error'
      : 'hint';
  });

  constructor() {
    effect(() => {
      if (!this.control()) {
        throw new Error('hlm-form-field must contain a BrnFormFieldControl.');
      }
    });
  }
}
