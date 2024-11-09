import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
} from 'rxjs';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { TrpcClient } from 'src/trpc-client';
import { showError } from '../utils/toast';

@Injectable({
  providedIn: 'root',
})
export class StripePaymentIntentService {
  private _trpc = inject(TrpcClient);
  private shoppingCartService = inject(ShoppingCartService);

  createPaymentIntent$ = new Subject<void>();

  private total = this.shoppingCartService.total;
  private cart = this.shoppingCartService.getCart;

  private paymentIntent$ = this.createPaymentIntent$.pipe(
    switchMap(() =>
      this._trpc.stripe.createPaymentIntent.mutate({
        totalAmountInCents: convertToCents(this.total()),
        cart: this.cart(),
      }),
    ),
    materialize(),
    share(),
  );

  private paymentIntentSuccess$ = this.paymentIntent$.pipe(
    filter((notification) => notification.kind === 'N'),
    dematerialize(),
    share(),
  );

  private paymentIntentError$ = this.paymentIntent$.pipe(
    filter((notification) => notification.kind === 'E'),
    map((notification) => new Error(notification.error)),
    share(),
  );

  private clientSecret$ = merge(
    this.createPaymentIntent$.pipe(map(() => null)),
    this.paymentIntentSuccess$.pipe(map((pi) => pi.client_secret)),
  );

  private status$ = merge(
    this.createPaymentIntent$.pipe(map(() => 'loading' as const)),
    this.paymentIntentSuccess$.pipe(map(() => 'success' as const)),
    this.paymentIntentError$.pipe(map(() => 'error' as const)),
  ).pipe(startWith('initial' as const));

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
}

const convertToCents = (amount: number) => amount * 100;
