import { computed, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Products } from 'src/db/schema';

export type ProductWithQuantity = Products & {
  quantity: number;
};

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private cart = signal<ProductWithQuantity[]>([]);

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

  error$ = new Subject<string>();

  addToCart(product: ProductWithQuantity): void {
    const cartProduct = this.cart().find((p) => p.id === product.id);
    if (!cartProduct) {
      this.cart.update((cart) => [...cart, product]);
      return;
    }

    if (product.quantity + cartProduct.quantity > cartProduct.stock) {
      this.error$.next(
        `Cannot add ${product.quantity} more ${product.name}(s) to the cart. 
    You already have ${cartProduct.quantity} in the cart, but only 
    ${cartProduct.stock} are in stock.`,
      );
      return;
    }

    this.cart.update((cart) =>
      cart.map((p) =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + product.quantity }
          : p,
      ),
    );
  }

  removeFromCart(productId: number): void {
    this.cart.update((cart) =>
      cart.filter((product) => product.id !== productId),
    );
  }

  updateQuantity(productId: number, quantity: number): void {
    const cartProduct = this.cart().find((product) => product.id === productId);

    if (!cartProduct) return;

    if (quantity > cartProduct.stock) return;

    if (quantity < 1) return;

    if (cartProduct.quantity === quantity) return;

    this.cart.update((cart) =>
      cart.map((product) =>
        product.id === productId ? { ...product, quantity } : product,
      ),
    );
  }

  clearCart(): void {
    this.cart.set([]);
  }
}
