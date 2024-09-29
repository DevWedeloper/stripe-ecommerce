import {
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlContainer,
  FormGroupDirective,
  NgControl,
  NgForm,
  NgModel,
} from '@angular/forms';
import { EMPTY, fromEvent, iif, merge, skip, startWith } from 'rxjs';
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
    [ngModelGroup]:not([withoutValidationErrors])
  `,
  standalone: true,
})
export class DynamicValidatorMessageDirective implements OnInit {
  private ngControl =
    inject(NgControl, { self: true, optional: true }) ||
    inject(ControlContainer, { self: true });
  private elementRef = inject(ElementRef);
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
    merge(
      this.ngControl.control.statusChanges,
      fromEvent(this.elementRef.nativeElement, 'blur'),
      iif(() => !!this.form, this.form!.ngSubmit, EMPTY),
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
