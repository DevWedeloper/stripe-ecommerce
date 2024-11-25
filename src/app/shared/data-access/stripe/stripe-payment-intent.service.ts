import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, merge, share, Subject } from 'rxjs';
import { TrpcClient } from 'src/trpc-client';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from '../../utils/rxjs';
import { showError } from '../../utils/toast';
import { ShoppingCartService } from '../shopping-cart.service';

@Injectable({
  providedIn: 'root',
})
export class StripePaymentIntentService {
  private _trpc = inject(TrpcClient);
  private shoppingCartService = inject(ShoppingCartService);

  private createPaymentIntent$ = new Subject<void>();

  private total = this.shoppingCartService.total;
  private cart = this.shoppingCartService.getCart;

  private paymentIntent$ = this.createPaymentIntent$.pipe(
    materializeAndShare(() =>
      this._trpc.stripe.createPaymentIntent.mutate({
        totalAmountInCents: convertToCents(this.total()),
        cart: this.cart(),
      }),
    ),
  );

  private paymentIntentSuccess$ = this.paymentIntent$.pipe(
    successStream(),
    share(),
  );

  private paymentIntentError$ = this.paymentIntent$.pipe(
    errorStream(),
    share(),
  );

  private clientSecret$ = merge(
    this.createPaymentIntent$.pipe(map(() => null)),
    this.paymentIntentSuccess$.pipe(map((pi) => pi.client_secret)),
  );

  private status$ = statusStream({
    loading: this.createPaymentIntent$,
    success: this.paymentIntentSuccess$,
    error: this.paymentIntentError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  clientSecret = toSignal(this.clientSecret$, {
    initialValue: null,
  });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    this.paymentIntentError$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error.message));
  }

  createPaymentIntent(): void {
    this.createPaymentIntent$.next();
  }
}

const convertToCents = (amount: number) => amount * 100;
