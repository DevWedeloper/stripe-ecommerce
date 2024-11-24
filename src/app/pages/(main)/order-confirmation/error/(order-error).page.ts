import { RouteMeta } from '@analogjs/router';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';
import {
  HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertIconDirective,
  HlmAlertTitleDirective,
} from '@spartan-ng/ui-alert-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { StripeConfirmPaymentService } from 'src/app/shared/data-access/stripe/stripe-confirm-payment.service';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';

export const routeMeta: RouteMeta = {
  canActivate: [() => inject(StripeConfirmPaymentService).hasError()],
};

@Component({
  selector: 'app-order-error',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    HlmIconComponent,
    HlmAlertDirective,
    HlmAlertDescriptionDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,
  ],
  providers: [provideIcons({ lucideTriangleAlert })],
  template: `
    <div hlmAlert variant="destructive">
      <hlm-icon hlmAlertIcon name="lucideAlertTriangle" />
      <h4 hlmAlertTitle>An error has occurred, please try again later.</h4>
      @if (errorMessage()) {
        <p hlmAlertDesc>Error: {{ errorMessage() }}</p>
      } @else {
        <p hlmAlertDesc>Error: Unknown</p>
      }
    </div>
    <a hlmBtn class="mx-auto mt-2 block w-fit" routerLink="/">
      Go back to Home
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrderErrorPageComponent implements OnInit {
  private shoppingCartService = inject(ShoppingCartService);
  protected errorMessage = inject(StripeConfirmPaymentService).errorMessage;

  ngOnInit(): void {
    this.shoppingCartService.setEditable(true);
  }
}
