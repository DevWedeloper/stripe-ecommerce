import { Injectable, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { StripeService } from 'ngx-stripe';
import {
  Subject,
  filter,
  map,
  materialize,
  merge,
  share,
  switchMap,
} from 'rxjs';
import { errorStream, statusStream, successStream } from '../../utils/rxjs';
import { ShoppingCartService } from '../shopping-cart.service';
import { StripeConfirmationTokenService } from './stripe-confirmation-token.service';
import { StripePaymentIntentService } from './stripe-payment-intent.service';

@Injectable({
  providedIn: 'root',
})
export class StripeConfirmPaymentService {
  private router = inject(Router);
  private stripeService = inject(StripeService);
  private shoppingCartService = inject(ShoppingCartService);

  private confirmPaymentTrigger$ = new Subject<void>();

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
    materialize(),
    share(),
  );

  private confirmPaymentSuccess$ = this.confirmPayment$.pipe(
    successStream(),
    share(),
  );

  private confirmPaymentSuccessWithData$ = this.confirmPaymentSuccess$.pipe(
    filter((data) => data.error === undefined),
    map((data) => data.paymentIntent),
  );

  private confirmPaymentSuccessWithError$ = this.confirmPaymentSuccess$.pipe(
    filter((data) => data.error !== undefined),
    map((data) => data.error),
  );

  private confirmPaymentError$ = this.confirmPayment$.pipe(
    errorStream(),
    share(),
  );

  private error$ = merge(
    this.confirmPaymentSuccessWithError$,
    this.confirmPaymentError$,
  );

  private status$ = statusStream({
    loading: this.confirmPaymentTrigger$,
    success: this.confirmPaymentSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  private error = toSignal(this.confirmPaymentError$, { initialValue: null });

  isLoading = computed(() => this.status() === 'loading');
  isSuccessful = computed(() => this.status() === 'success');
  hasError = computed(() => this.status() === 'error');

  errorMessage = computed(() => this.error()?.message);

  constructor() {
    this.confirmPaymentSuccessWithData$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.shoppingCartService.clearCart();
        this.router.navigate(['/order-confirmation/success']);
      });

    this.error$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.router.navigate(['/order-confirmation/error']);
    });
  }

  confirmPayment(): void {
    this.confirmPaymentTrigger$.next();
  }
}
