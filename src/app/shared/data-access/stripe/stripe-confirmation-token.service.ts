import { computed, effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ConfirmationToken } from '@stripe/stripe-js';
import { StripePaymentElementComponent, StripeService } from 'ngx-stripe';
import {
  filter,
  map,
  materialize,
  merge,
  share,
  shareReplay,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { errorStream, statusStream, successStream } from '../../utils/rxjs';

@Injectable({
  providedIn: 'root',
})
export class StripeConfirmationTokenService {
  private router = inject(Router);
  private stripeService = inject(StripeService);

  private createConfirmationToken$ = new Subject<ConfirmationToken.Shipping>();
  private paymentElement$ = new Subject<
    StripePaymentElementComponent | undefined
  >();

  private confirmationToken$ = this.createConfirmationToken$.pipe(
    withLatestFrom(this.paymentElement$),
    map(([shipping, paymentElement]) => {
      if (!paymentElement) {
        throw new Error('Payment element is undefined.');
      }
      return { shipping, paymentElement };
    }),
    switchMap(({ shipping, paymentElement }) =>
      this.stripeService.createConfirmationToken({
        elements: paymentElement.elements,
        params: {
          shipping,
        },
      }),
    ),
    materialize(),
    share(),
  );

  private confirmationTokenSuccess$ = this.confirmationToken$.pipe(
    successStream(),
    share(),
  );

  private confirmationTokenSuccessWithData$ =
    this.confirmationTokenSuccess$.pipe(
      filter((data) => data.error === undefined),
      map((data) => data.confirmationToken),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  private confirmationTokenSuccessWithError$ =
    this.confirmationTokenSuccess$.pipe(
      filter((data) => data.error !== undefined),
      map((data) => data.error),
    );

  private confirmationTokenError$ = this.confirmationToken$.pipe(
    errorStream(),
    share(),
  );

  confirmationTokenId$ = this.confirmationTokenSuccessWithData$.pipe(
    map((data) => data.id),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private emailAndShippingAddress$ =
    this.confirmationTokenSuccessWithData$.pipe(
      map(({ payment_method_preview, shipping }) => {
        const email = payment_method_preview.billing_details.email;
        const shippingAddress = shipping;
        return { email, shippingAddress };
      }),
    );

  private error$ = merge(
    this.confirmationTokenSuccessWithError$,
    this.confirmationTokenError$,
  );

  private status$ = statusStream({
    loading: this.createConfirmationToken$,
    success: this.confirmationTokenSuccessWithData$,
    error: this.error$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  private error = toSignal(this.confirmationTokenError$, {
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

  createConfirmationToken(data: ConfirmationToken.Shipping): void {
    this.createConfirmationToken$.next(data);
  }

  setPaymentElement(
    paymentElement: StripePaymentElementComponent | undefined,
  ): void {
    this.paymentElement$.next(paymentElement);
  }
}
