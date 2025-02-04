import { computed, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, merge, share, shareReplay, Subject } from 'rxjs';
import { TrpcClient } from 'src/trpc-client';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from '../../utils/rxjs';
import { showError } from '../../utils/toast';
import { AuthService } from '../auth.service';
import { ShoppingCartService } from '../shopping-cart.service';

@Injectable({
  providedIn: 'root',
})
export class StripePaymentIntentService {
  private _trpc = inject(TrpcClient);
  private authService = inject(AuthService);
  private shoppingCartService = inject(ShoppingCartService);

  private createPaymentIntent$ = new Subject<void>();

  private total = this.shoppingCartService.total;
  private user = this.authService.user;
  private cart = this.shoppingCartService.getCart;

  private paymentIntent$ = this.createPaymentIntent$.pipe(
    materializeAndShare(() =>
      this._trpc.stripe.createPaymentIntent.mutate({
        totalAmountInCents: convertToCents(this.total()),
        userId: this.user()?.id ?? null,
        orderDate: new Date(),
        cart: this.cart().map(({ userId, ...rest }) => ({
          sellerUserId: userId,
          ...rest,
        })),
      }),
    ),
  );

  private paymentIntentSuccess$ = this.paymentIntent$.pipe(
    successStream(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private paymentIntentError$ = this.paymentIntent$.pipe(
    errorStream(),
    share(),
  );

  clientSecret$ = merge(
    this.createPaymentIntent$.pipe(map(() => null)),
    this.paymentIntentSuccess$.pipe(map((pi) => pi.client_secret)),
  ).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  paymentIntentId$ = this.paymentIntentSuccess$.pipe(
    map((data) => data.id),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  paymentIntentMetadata$ = this.paymentIntentSuccess$.pipe(
    map((data) => data.metadata),
    shareReplay({ bufferSize: 1, refCount: true }),
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
