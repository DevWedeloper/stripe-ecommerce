import { computed, effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { showError } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class StripePaymentIntentService {
  private _trpc = inject(TrpcClient);
  private shoppingCartService = inject(ShoppingCartService);

  createPaymentIntent$ = new Subject<void>();

  private total = this.shoppingCartService.total;
  private products = this.shoppingCartService.getCart;

  private paymentIntent$ = this.createPaymentIntent$.pipe(
    switchMap(() =>
      this._trpc.stripe.createPaymentIntent.mutate({
        amountInCents: convertToCents(this.total()),
        products: this.products(),
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

  private error = toSignal(this.paymentIntentError$, { initialValue: null });

  private hasError = computed(() => this.status() === 'error');

  private errorMessage = computed(() => this.error()?.message);

  clientSecret = toSignal(this.clientSecret$, {
    initialValue: null,
  });

  isLoading = computed(() => this.status() === 'loading');

  constructor() {
    effect(
      () => {
        if (this.hasError() && this.errorMessage())
          showError(this.errorMessage()!);
      },
      { allowSignalWrites: true },
    );
  }
}

const convertToCents = (amount: number) => amount * 100;
