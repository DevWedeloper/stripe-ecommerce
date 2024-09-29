import { Directive, inject, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[validatorMessageContainer]',
  standalone: true,
  exportAs: 'validatorMessageContainer',
})
export class ValidatorMessageContainerDirective {
  container = inject(ViewContainerRef);
}
