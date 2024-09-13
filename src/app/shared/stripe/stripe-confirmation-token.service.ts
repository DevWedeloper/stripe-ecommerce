import { computed, effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { StripePaymentElementComponent, StripeService } from 'ngx-stripe';
import {
  dematerialize,
  filter,
  map,
  materialize,
  merge,
  share,
  startWith,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StripeConfirmationTokenService {
  private router = inject(Router);
  private stripeService = inject(StripeService);

  createConfirmationToken$ = new Subject<void>();
  paymentElement$ = new Subject<StripePaymentElementComponent | undefined>();

  private confirmationToken$ = this.createConfirmationToken$.pipe(
    withLatestFrom(this.paymentElement$),
    map(([_, paymentElement]) => {
      if (!paymentElement) {
        throw new Error('Payment element is undefined.');
      }
      return { paymentElement };
    }),
    switchMap(({ paymentElement }) =>
      this.stripeService.createConfirmationToken({
        elements: paymentElement.elements,
      }),
    ),
    map((data) => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.confirmationToken;
    }),
    materialize(),
    share(),
  );

  private confirmationTokenSuccess$ = this.confirmationToken$.pipe(
    filter((notification) => notification.kind === 'N'),
    dematerialize(),
    share(),
  );

  private confirmationTokenError$ = this.confirmationToken$.pipe(
    filter((notification) => notification.kind === 'E'),
    map((notification) => new Error(notification.error)),
    share(),
  );

  private confirmationTokenId$ = this.confirmationTokenSuccess$.pipe(
    map((data) => data.id),
  );

  private emailAndShippingAddress$ = this.confirmationTokenSuccess$.pipe(
    map(({ payment_method_preview, shipping }) => {
      const email = payment_method_preview.billing_details.email;
      const shippingAddress = shipping;
      return { email, shippingAddress };
    }),
  );

  private status$ = merge(
    this.createConfirmationToken$.pipe(map(() => 'loading' as const)),
    this.confirmationTokenSuccess$.pipe(map(() => 'success' as const)),
    this.confirmationTokenError$.pipe(map(() => 'error' as const)),
  ).pipe(startWith('initial' as const));

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  private error = toSignal(this.confirmationTokenError$, {
    initialValue: null,
  });

  confirmationTokenId = toSignal(this.confirmationTokenId$, {
    initialValue: null,
  });

  emailAndShippingAddress = toSignal(this.emailAndShippingAddress$, {
    initialValue: {
      email: null,
      shippingAddress: null,
    },
  });

  isLoading = computed(() => this.status() === 'loading');
  isSuccessful = computed(() => this.status() === 'success');
  hasError = computed(() => this.status() === 'error');

  errorMessage = computed(() => this.error()?.message);

  constructor() {
    effect(() => {
      if (this.isSuccessful())
        this.router.navigate(['/order-confirmation'], { replaceUrl: true });
    });
  }
}
