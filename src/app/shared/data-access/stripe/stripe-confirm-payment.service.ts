import { Injectable, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { StripeService } from 'ngx-stripe';
import {
  Subject,
  defer,
  filter,
  iif,
  map,
  materialize,
  merge,
  of,
  share,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { CreateOrderSchema } from 'src/schemas/order';
import { TrpcClient } from 'src/trpc-client';
import { errorStream, statusStream, successStream } from '../../utils/rxjs';
import { FinalizedAddressService } from '../address/finalized-address.service';
import { GetAddressCheckoutService } from '../address/get-address-checkout.service';
import { ShoppingCartService } from '../shopping-cart.service';
import { StripeConfirmationTokenService } from './stripe-confirmation-token.service';
import { StripePaymentIntentService } from './stripe-payment-intent.service';

@Injectable({
  providedIn: 'root',
})
export class StripeConfirmPaymentService {
  private router = inject(Router);
  private _trpc = inject(TrpcClient);
  private stripeService = inject(StripeService);
  private stripeConfirmationTokenService = inject(
    StripeConfirmationTokenService,
  );
  private stripePaymentIntentService = inject(StripePaymentIntentService);
  private shoppingCartService = inject(ShoppingCartService);
  private getAddressCheckoutService = inject(GetAddressCheckoutService);
  private finalizedAddressService = inject(FinalizedAddressService);

  private confirmPaymentTrigger$ = new Subject<void>();

  private selectedAddress$ = this.getAddressCheckoutService.selectedAddress$;
  private finalizedAddress$ = this.finalizedAddressService.address$;
  private paymentIntentId$ = this.stripePaymentIntentService.paymentIntentId$;
  private paymentIntentMetadata$ =
    this.stripePaymentIntentService.paymentIntentMetadata$;
  private clientSecret$ = this.stripePaymentIntentService.clientSecret$;
  private confirmationTokenId$ =
    this.stripeConfirmationTokenService.confirmationTokenId$;

  private confirmPayment$ = this.confirmPaymentTrigger$.pipe(
    withLatestFrom(this.selectedAddress$, this.finalizedAddress$),
    switchMap(([_, selectedAddress, finalizedAddress]) =>
      iif(
        () => !!selectedAddress,
        defer(() =>
          of(
            (() => {
              if (!selectedAddress) {
                throw new Error(
                  'Selected address cannot be null or undefined.',
                );
              }

              return {
                addressId: selectedAddress.addressId,
                receiverId: selectedAddress.receiverId,
              };
            })(),
          ),
        ),
        defer(() =>
          this._trpc.addresses.createAddressWithoutUser.mutate(
            (() => {
              if (!finalizedAddress) {
                throw new Error(
                  'Finalized address cannot be null or undefined.',
                );
              }

              return finalizedAddress;
            })(),
          ),
        ),
      ),
    ),
    withLatestFrom(this.paymentIntentId$, this.paymentIntentMetadata$),
    switchMap(([{ addressId, receiverId }, id, metadata]) => {
      const addressDetails: Pick<
        CreateOrderSchema,
        'shippingAddressId' | 'receiverId'
      > = {
        shippingAddressId: addressId,
        receiverId: receiverId,
      };

      return this._trpc.stripe.updatePaymentIntentMetadata.mutate({
        id,
        metadata: {
          ...metadata,
          ...addressDetails,
        },
      });
    }),
    withLatestFrom(this.clientSecret$, this.confirmationTokenId$),
    map(([_, clientSecret, confirmationTokenId]) => {
      if (!clientSecret) {
        throw new Error('Client secret is null.');
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
