import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { ProductItems } from 'src/db/schema';
import { z } from 'zod';
import { CartItem } from '../types/cart';
import { showError } from '../utils/toast';

type UniqueItemIdentifier = {
  productItemId: ProductItems['id'];
  sku: ProductItems['sku'];
};

const variationObjectSchema = z.object({
  name: z.string(),
  value: z.string(),
  order: z.number(),
});

const cartItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  sku: z.string(),
  stock: z.number().nonnegative(),
  price: z.number().nonnegative(),
  imagePath: z.string().nullable(),
  placeholder: z.string().nullable(),
  variations: z.array(variationObjectSchema),
  productItemId: z.number(),
  quantity: z.number().min(1),
});

const cartSchema = z.array(cartItemSchema);

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private PLATFORM_ID = inject(PLATFORM_ID);

  private CART_STORAGE_KEY = 'shoppingCart';
  private CART_EXPIRY_KEY = 'cartExpiry';
  private CART_EXPIRY_DURATION = 1 * 24 * 60 * 60 * 1000;

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
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      this.loadCartFromStorage();
    }

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) => showError(error));
  }

  addToCart(item: CartItem): void {
    if (!this.isEditable()) return;

    const cartItem = this.cart().find((i) => isSameItem(i, item));
    if (!cartItem) {
      this.cart.update((cart) => [...cart, item]);
      this.saveCartToStorage();
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
    this.saveCartToStorage();
  }

  removeFromCart(productItemId: number, sku: string): void {
    if (!this.isEditable()) return;

    this.cart.update((cart) =>
      cart.filter(
        (item) => item.productItemId !== productItemId && item.sku !== sku,
      ),
    );

    this.saveCartToStorage();
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

    this.saveCartToStorage();
  }

  setEditable(editable: boolean): void {
    this.editable$.next(editable);
  }

  clearCart(): void {
    this.cart.set([]);
    this.clearCartStorage();
  }

  private loadCartFromStorage(): void {
    const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
    const cartExpiry = localStorage.getItem(this.CART_EXPIRY_KEY);

    if (!cartData || !cartExpiry) {
      this.clearCartStorage();
      return;
    }

    const parsedCart = (() => {
      try {
        return JSON.parse(cartData);
      } catch {
        console.error('Malformed cart JSON data.');
        this.clearCartStorage();
        return null;
      }
    })();

    if (parsedCart === null) {
      return;
    }

    const { error } = cartSchema.safeParse(parsedCart);

    if (error) {
      this.clearCartStorage();
      return;
    }

    const expiryTime = parseInt(cartExpiry, 10);
    const currentTime = Date.now();

    if (currentTime <= expiryTime) {
      this.cart.set(parsedCart);
      return;
    }

    this.clearCartStorage();
  }

  private saveCartToStorage(): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cart()));
    const expiryTime = Date.now() + this.CART_EXPIRY_DURATION;
    localStorage.setItem(this.CART_EXPIRY_KEY, expiryTime.toString());
  }

  private clearCartStorage(): void {
    localStorage.removeItem(this.CART_STORAGE_KEY);
    localStorage.removeItem(this.CART_EXPIRY_KEY);
  }
}

const isSameItem = (
  currentItem: UniqueItemIdentifier,
  newItem: UniqueItemIdentifier,
): boolean =>
  currentItem.productItemId === newItem.productItemId &&
  currentItem.sku === newItem.sku;
