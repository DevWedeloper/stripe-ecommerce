import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import {
  BrnSheetContentDirective,
  BrnSheetTriggerDirective,
} from '@spartan-ng/ui-sheet-brain';
import {
  HlmSheetComponent,
  HlmSheetContentComponent,
} from '@spartan-ng/ui-sheet-helm';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { ViewCartComponent } from 'src/app/shared/view-cart.component';

@Component({
  selector: 'app-cart-details',
  standalone: true,
  imports: [
    CurrencyPipe,
    HlmButtonDirective,
    HlmIconComponent,
    BrnSheetTriggerDirective,
    BrnSheetContentDirective,
    HlmSheetComponent,
    HlmSheetContentComponent,
    ViewCartComponent,
  ],
  providers: [provideIcons({ lucideChevronDown })],
  template: `
    <app-view-cart class="hidden md:block" [cart]="cart()" [total]="total()" />

    <div class="flex flex-col items-center justify-center gap-2 md:hidden">
      <span class="text-2xl font-bold">
        Total: {{ total() | currency: 'USD' }}
      </span>
      <hlm-sheet side="top">
        <button variant="outline" brnSheetTrigger hlmBtn>
          View Details
          <hlm-icon size="sm" class="ml-2" name="lucideChevronDown" />
        </button>
        <hlm-sheet-content *brnSheetContent>
          <app-view-cart [cart]="cart()" [total]="total()" />
        </hlm-sheet-content>
      </hlm-sheet>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDetailsComponent {
  private shoppingCartService = inject(ShoppingCartService);

  protected cart = this.shoppingCartService.getCart;
  protected total = this.shoppingCartService.total;
}
