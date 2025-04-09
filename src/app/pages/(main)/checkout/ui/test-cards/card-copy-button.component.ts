import { ClipboardModule } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { hlm } from '@spartan-ng/brain/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { delay, filter, fromEvent, map, merge, switchMap } from 'rxjs';

@Component({
  selector: 'app-card-copy-button',
  standalone: true,
  imports: [ClipboardModule, HlmButtonDirective],
  template: `
    <button
      #button
      hlmBtn
      [class]="computedClass()"
      [cdkCopyToClipboard]="cardNumber()"
    >
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCopyButtonComponent {
  cardNumber = input.required<string>();

  private button = viewChild<ElementRef<HTMLButtonElement>>('button');

  private state$ = toObservable(this.button).pipe(
    filter(Boolean),
    switchMap((button) =>
      merge(
        fromEvent(button.nativeElement, 'click').pipe(map(() => true)),
        fromEvent(button.nativeElement, 'mouseleave').pipe(
          delay(50),
          map(() => false),
        ),
      ),
    ),
  );

  private state = toSignal(this.state$, { initialValue: false });

  protected computedClass = computed(() => {
    const content = this.state()
      ? `after:content-['Copied!']`
      : `after:content-['Copy']`;
    return hlm(
      'relative flex w-full justify-between after:absolute after:inset-0 after:flex after:items-center after:justify-center after:rounded-md after:font-bold after:text-primary after:opacity-0 after:transition hover:bg-transparent hover:text-accent-foreground after:hover:bg-accent/85 after:hover:opacity-100',
      content,
    );
  });
}
