import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { filter, map, share, withLatestFrom } from 'rxjs';
import { ShoppingCartService } from 'src/app/shared/data-access/shopping-cart.service';
import {
  errorStream,
  materializeAndShare,
  statusStream,
  successStream,
} from 'src/app/shared/utils/rxjs';
import { showError } from 'src/app/shared/utils/toast';
import { TrpcClient } from 'src/trpc-client';

@Injectable()
export class ConfirmCartService {
  private PLATFORM_ID = inject(PLATFORM_ID);
  private _trpc = inject(TrpcClient);
  private shoppingCartService = inject(ShoppingCartService);

  private cart$ = toObservable(this.shoppingCartService.getCart);

  private productItemIds$ = this.cart$.pipe(
    map((cart) =>
      cart.map((item) => ({
        productItemId: item.productItemId,
      })),
    ),
  );

  private getLatestCart$ = this.productItemIds$.pipe(
    materializeAndShare((data) =>
      this._trpc.products.getPricingDetails.query(data),
    ),
  );

  private getLatestCartSuccess$ = this.getLatestCart$.pipe(
    successStream(),
    withLatestFrom(this.cart$),
    map(([data, cart]) => {
      const priceMap = new Map(
        data.map((item) => [item.productItemId, item.price]),
      );

      return cart.map((cartItem) => ({
        ...cartItem,
        price: priceMap.get(cartItem.productItemId) ?? cartItem.price,
      }));
    }),
    share(),
  );

  private getLatestCartError$ = this.getLatestCart$.pipe(
    errorStream(),
    share(),
  );

  private status$ = statusStream({
    loading: this.productItemIds$,
    success: this.getLatestCartSuccess$,
    error: this.getLatestCartError$,
  });

  private status = toSignal(this.status$, { initialValue: 'initial' as const });

  isLoading = computed(() => this.status() === 'loading');

  cart = toSignal(this.getLatestCartSuccess$, { initialValue: [] });

  total = computed(() => {
    const items = this.cart();
    const totalCost = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return totalCost;
  });

  constructor() {
    this.getLatestCartError$
      .pipe(
        filter(() => isPlatformBrowser(this.PLATFORM_ID)),
        takeUntilDestroyed(),
      )
      .subscribe((error) => showError(error.message));
  }
}
