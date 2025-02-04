import { RouteMeta } from '@analogjs/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import {
  HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertIconDirective,
  HlmAlertTitleDirective,
} from '@spartan-ng/ui-alert-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { StripeConfirmPaymentService } from 'src/app/shared/data-access/stripe/stripe-confirm-payment.service';

export const routeMeta: RouteMeta = {
  canActivate: [() => inject(StripeConfirmPaymentService).isSuccessful()],
};

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
    HlmAlertDirective,
    HlmAlertDescriptionDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,
  ],
  providers: [provideIcons({ lucideCheck })],
  template: `
    <div hlmAlert>
      <ng-icon hlm hlmAlertIcon name="lucideCheck" />
      <h4 hlmAlertTitle>Order Confirmed!</h4>
      <p hlmAlertDesc>
        Your order has been successfully placed. We’ll notify you when it’s on
        its way.
      </p>
    </div>
    <a hlmBtn class="mx-auto mt-2 block w-fit" routerLink="/">
      Go back to Home
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrderSuccessPageComponent {}
