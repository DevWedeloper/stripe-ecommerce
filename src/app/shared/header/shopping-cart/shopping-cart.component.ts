import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideShoppingCart } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import {
  BrnPopoverComponent,
  BrnPopoverContentDirective,
  BrnPopoverTriggerDirective,
} from '@spartan-ng/ui-popover-brain';
import { HlmPopoverContentDirective } from '@spartan-ng/ui-popover-helm';
import { HlmScrollAreaComponent } from '@spartan-ng/ui-scrollarea-helm';
import { EmptyCartComponent } from '../../fallback-ui/empty-cart.component';
import { ShoppingCartService } from '../../shopping-cart.service';
import { CartItemComponent } from './cart-item.component';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    HlmIconComponent,
    HlmScrollAreaComponent,
    BrnPopoverComponent,
    BrnPopoverTriggerDirective,
    BrnPopoverContentDirective,
    HlmPopoverContentDirective,
    CartItemComponent,
    EmptyCartComponent,
  ],
  providers: [provideIcons({ lucideShoppingCart })],
  template: `
    <brn-popover>
      <button
        hlmBtn
        size="sm"
        variant="ghost"
        brnPopoverTrigger
        class="relative"
      >
        @if (totalQuantity()) {
          <span
            class="absolute right-[-8px] top-[-4px] flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-sm"
          >
            {{ totalQuantity() > 99 ? '99+' : totalQuantity() }}
          </span>
        }
        <hlm-icon size="sm" name="lucideShoppingCart" />
      </button>
      <div hlmPopoverContent *brnPopoverContent="let ctx" class="w-80 p-2">
        <hlm-scroll-area class="h-96">
          @for (item of cart(); track $index) {
            <app-cart-item
              [item]="item"
              [isEditable]="isEditable()"
              (removeFromCartChange)="removeFromCart(item.productId, item.sku)"
            />
          } @empty {
            <div class="flex h-96 items-center justify-center">
              <app-empty-cart />
            </div>
          }
        </hlm-scroll-area>
        <div class="flex flex-col gap-2">
          <a
            hlmBtn
            class="w-full"
            (click)="closePopover()"
            routerLink="/shopping-cart"
          >
            View Cart
          </a>
          <button
            hlmBtn
            class="w-full"
            (click)="proceedToCheckout()"
            [disabled]="!cart().length"
          >
            Checkout
          </button>
        </div>
      </div>
    </brn-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingCartComponent {
  private router = inject(Router);
  private shoppingCartService = inject(ShoppingCartService);
  private brnPopoverComponent = viewChild.required(BrnPopoverComponent);

  protected cart = this.shoppingCartService.getCart;
  protected totalQuantity = this.shoppingCartService.totalQuantity;
  protected isEditable = this.shoppingCartService.isEditable;

  protected closePopover(): void {
    this.brnPopoverComponent().close(null);
  }

  protected removeFromCart(productId: number, sku: string) {
    this.shoppingCartService.removeFromCart(productId, sku);
  }

  protected proceedToCheckout(): void {
    this.closePopover();
    this.router.navigate(['checkout'], { replaceUrl: true });
  }
}
