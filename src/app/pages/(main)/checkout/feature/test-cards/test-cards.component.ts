import {
  ChangeDetectionStrategy,
  Component,
  computed,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronsUpDown,
  lucideCreditCard,
  lucideEllipsis,
  lucideShieldCheck,
  lucideX,
} from '@ng-icons/lucide';
import {
  BrnCollapsibleComponent,
  BrnCollapsibleContentComponent,
  BrnCollapsibleTriggerDirective,
} from '@spartan-ng/brain/collapsible';
import { hlm } from '@spartan-ng/brain/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { CardCopyButtonComponent } from './card-copy-button.component';

@Component({
  selector: 'app-test-cards',
  standalone: true,
  imports: [
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
    BrnCollapsibleComponent,
    BrnCollapsibleTriggerDirective,
    BrnCollapsibleContentComponent,
    CardCopyButtonComponent,
  ],
  providers: [
    provideIcons({
      lucideCreditCard,
      lucideChevronsUpDown,
      lucideCheck,
      lucideShieldCheck,
      lucideX,
      lucideEllipsis,
    }),
  ],
  template: `
    <brn-collapsible
      class="flex w-[350px] max-w-[85vw] flex-col rounded-t-md border border-border bg-background p-4"
    >
      <div class="flex items-center justify-between">
        <h4 class="flex items-center gap-2 text-sm font-semibold">
          <ng-icon hlm size="sm" name="lucideCreditCard" />
          TEST CARDS
        </h4>
        <button brnCollapsibleTrigger hlmBtn variant="ghost" size="icon">
          <ng-icon hlm size="sm" name="lucideChevronsUpDown" />
          <span class="sr-only">Toggle</span>
        </button>
      </div>
      <brn-collapsible-content [class]="computedClass()">
        <div class="overflow-hidden">
          <div class="flex flex-col gap-2">
            <app-card-copy-button [cardNumber]="cardNumbers.success">
              <span class="flex items-center gap-2">
                <ng-icon hlm size="sm" name="lucideCheck" />
                Success
              </span>
              <span class="flex items-center gap-2">
                <ng-icon hlm size="sm" name="lucideEllipsis" />
                4242
              </span>
            </app-card-copy-button>
            <app-card-copy-button [cardNumber]="cardNumbers.authentication">
              <span class="flex items-center gap-2">
                <ng-icon hlm size="sm" name="lucideShieldCheck" />
                Authentication
              </span>
              <span class="flex items-center gap-2">
                <ng-icon hlm size="sm" name="lucideEllipsis" />
                3155
              </span>
            </app-card-copy-button>
            <app-card-copy-button [cardNumber]="cardNumbers.decline">
              <span class="flex items-center gap-2">
                <ng-icon hlm size="sm" name="lucideX" />
                Decline
              </span>
              <span class="flex items-center gap-2">
                <ng-icon hlm size="sm" name="lucideEllipsis" />
                0002
              </span>
            </app-card-copy-button>
          </div>

          <p class="mt-4">
            Click to copy the card number or use any of
            <a
              hlmBtn
              variant="link"
              class="h-6 px-0.5 text-base underline"
              href="https://docs.stripe.com/testing#cards"
              target="_blank"
            >
              Stripe's test cards
            </a>
            . Use any future expiration date and three-number CVC.
          </p>
        </div>
      </brn-collapsible-content>
    </brn-collapsible>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCardsComponent {
  private brnCollapsibleTrigger = viewChild.required(
    BrnCollapsibleTriggerDirective,
  );

  private state = computed(() => this.brnCollapsibleTrigger().state());

  protected cardNumbers = {
    success: '4242424242424242',
    authentication: '4000000000003220',
    decline: '4000000000000002',
  };

  protected computedClass = computed(() => {
    const gridRows =
      this.state() === 'open' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]';
    return hlm('grid transition-all', gridRows);
  });
}
