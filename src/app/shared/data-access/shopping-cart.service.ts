import { computed, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { ProductItems } from 'src/db/schema';
import { CartItem } from '../types/cart';
import { showError } from '../utils/toast';

type UniqueItemIdentifier = {
  productItemId: ProductItems['id'];
  sku: ProductItems['sku'];
};

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private cart = signal<CartItem[]>([]);

  private editable$ = new Subject<boolean>();

  total = computed(() => {
    const items = this.cart();
    const totalCost = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return totalCost;
  });

  totalQuantity = computed(() => {
    const items = this.cart();
    const totalQuantity = items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
    return totalQuantity;
  });

  getCart = computed(() => this.cart());

  isEditable = toSignal(this.editable$, { initialValue: true });

  private error$ = new Subject<string>();

  constructor() {
    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error));
  }

  addToCart(item: CartItem): void {
    if (!this.isEditable()) return;

    const cartItem = this.cart().find((i) => isSameItem(i, item));
    if (!cartItem) {
      this.cart.update((cart) => [...cart, item]);
      return;
    }

    if (item.quantity + cartItem.quantity > cartItem.stock) {
      this.error$.next(
        `Cannot add ${item.quantity} more ${item.name}(s) to the cart. 
    You already have ${cartItem.quantity} in the cart, but only 
    ${cartItem.stock} are in stock.`,
      );
      return;
    }

    this.cart.update((cart) =>
      cart.map((p) =>
        isSameItem(p, item)
          ? { ...p, quantity: p.quantity + item.quantity }
          : p,
      ),
    );
  }

  removeFromCart(productItemId: number, sku: string): void {
    if (!this.isEditable()) return;

    this.cart.update((cart) =>
      cart.filter(
        (item) => item.productItemId !== productItemId && item.sku !== sku,
      ),
    );
  }

  updateQuantity(productItemId: number, sku: string, quantity: number): void {
    if (!this.isEditable()) return;

    const identifier: UniqueItemIdentifier = { productItemId, sku };
    const cartItem = this.cart().find((item) => isSameItem(item, identifier));

    if (!cartItem) return;

    if (quantity > cartItem.stock) return;

    if (quantity < 1) return;

    if (cartItem.quantity === quantity) return;

    this.cart.update((cart) =>
      cart.map((product) =>
        isSameItem(product, identifier) ? { ...product, quantity } : product,
      ),
    );
  }

  setEditable(editable: boolean): void {
    this.editable$.next(editable);
  }

  clearCart(): void {
    this.cart.set([]);
  }
}

const isSameItem = (
  currentItem: UniqueItemIdentifier,
  newItem: UniqueItemIdentifier,
): boolean =>
  currentItem.productItemId === newItem.productItemId &&
  currentItem.sku === newItem.sku;
