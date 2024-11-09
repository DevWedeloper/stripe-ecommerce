import { Injectable, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { StripeService } from 'ngx-stripe';
import {
  Subject,
  map,
  materialize,
  merge,
  share,
  startWith,
  switchMap,
} from 'rxjs';
import { ShoppingCartService } from '../shopping-cart.service';
import { errorStream, successStream } from '../utils/rxjs';
import { StripeConfirmationTokenService } from './stripe-confirmation-token.service';
import { StripePaymentIntentService } from './stripe-payment-intent.service';

@Injectable({
  providedIn: 'root',
})
export class StripeConfirmPaymentService {
  private router = inject(Router);
  private stripeService = inject(StripeService);
  private shoppingCartService = inject(ShoppingCartService);

  confirmPaymentTrigger$ = new Subject<void>();

  private clientSecret = inject(StripePaymentIntentService).clientSecret;
  private confirmationTokenId = inject(StripeConfirmationTokenService)
    .confirmationTokenId;

  private confirmPayment$ = this.confirmPaymentTrigger$.pipe(
    map(() => {
      const clientSecret = this.clientSecret();
      const confirmationTokenId = this.confirmationTokenId();

      if (!clientSecret) {
        throw new Error('Client secret is null.');
      }

      if (!confirmationTokenId) {
        throw new Error('Confirm token id is null.');
      }

      return { clientSecret, confirmationTokenId };
    }),
    switchMap(({ clientSecret, confirmationTokenId }) =>
      this.stripeService.confirmPayment({
        clientSecret,
        confirmParams: {
          confirmation_token: confirmationTokenId,
        },
        redirect: 'if_required',
      }),
    ),
    map((data) => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.paymentIntent;
    }),
    materialize(),
    share(),
  );

  private confirmPaymentSuccess$ = this.confirmPayment$.pipe(successStream());

  private confirmPaymentError$ = this.confirmPayment$.pipe(
    errorStream(),
    share(),
  );

  private status$ = merge(
    this.confirmPaymentTrigger$.pipe(map(() => 'loading' as const)),
    this.confirmPaymentError$.pipe(map(() => 'error' as const)),
    this.confirmPaymentSuccess$.pipe(map(() => 'success' as const)),
  ).pipe(startWith('initial' as const));

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  private error = toSignal(this.confirmPaymentError$, { initialValue: null });

  isLoading = computed(() => this.status() === 'loading');
  isSuccessful = computed(() => this.status() === 'success');
  hasError = computed(() => this.status() === 'error');

  errorMessage = computed(() => this.error()?.message);

  constructor() {
    effect(
      () => {
        if (this.isSuccessful()) {
          this.shoppingCartService.clearCart();
          this.router.navigate(['/order-confirmation/success']);
        }
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      if (this.hasError()) this.router.navigate(['/order-confirmation/error']);
    });
  }
}
