import {
  ComponentRef,
  DestroyRef,
  Directive,
  inject,
  input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlContainer,
  FormGroupDirective,
  FormResetEvent,
  FormSubmittedEvent,
  NgControl,
  NgForm,
  NgModel,
  StatusChangeEvent,
  TouchedChangeEvent,
} from '@angular/forms';
import { EMPTY, filter, iif, skip, startWith } from 'rxjs';
import {
  ERROR_COMPONENT,
  ErrorComponent,
} from './input-error/error-component.token';
import { ErrorStateMatcherService } from './input-error/error-state-matcher.service';
import { InputErrorComponent } from './input-error/input-error.component';

@Directive({
  selector: `
    [ngModel]:not([withoutValidationErrors]),
    [formControl]:not([withoutValidationErrors]),
    [formControlName]:not([withoutValidationErrors]),
    [formGroupName]:not([withoutValidationErrors]),
    [formArrayName]:not([withoutValidationErrors]),
    [ngModelGroup]:not([withoutValidationErrors])
  `,
  standalone: true,
})
export class DynamicValidatorMessageDirective implements OnInit {
  private ngControl =
    inject(NgControl, { self: true, optional: true }) ||
    inject(ControlContainer, { self: true });
  private parentContainer = inject(ControlContainer, { optional: true });
  private destroyRef = inject(DestroyRef);

  errorStateMatcher = input<ErrorStateMatcherService>(
    inject(ErrorStateMatcherService),
  );
  container = input<ViewContainerRef>(inject(ViewContainerRef));

  private form = this.parentContainer?.formDirective as
    | NgForm
    | FormGroupDirective
    | null;

  private componentRef: ComponentRef<ErrorComponent> | null = null;

  private errorComponent =
    inject(ERROR_COMPONENT, { optional: true }) || InputErrorComponent;

  ngOnInit(): void {
    if (!this.ngControl.control)
      throw Error(`No control model for ${this.ngControl.name} control...`);
    iif(
      () => !!this.form,
      this.form!.control.events.pipe(
        filter(
          (event) =>
            event instanceof StatusChangeEvent ||
            event instanceof TouchedChangeEvent ||
            event instanceof FormSubmittedEvent ||
            event instanceof FormResetEvent,
        ),
      ),
      EMPTY,
    )
      .pipe(
        startWith(this.ngControl.control.status),
        skip(this.ngControl instanceof NgModel ? 1 : 0),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (
          this.errorStateMatcher().isErrorVisible(
            this.ngControl.control,
            this.form,
          )
        ) {
          if (!this.componentRef) {
            this.componentRef = this.container().createComponent(
              this.errorComponent,
            );
            this.componentRef.changeDetectorRef.markForCheck();
          }
          this.componentRef.setInput('errors', this.ngControl.errors);
        } else {
          this.componentRef?.destroy();
          this.componentRef = null;
        }
      });
  }
}
