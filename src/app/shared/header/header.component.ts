import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AccountComponent } from './account/account.component';
import { CategoriesComponent } from './categories/categories.component';
import { HeaderDarkModeComponent } from './header-dark-mode.component';
import { HomeButtonComponent } from './home-button.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    HomeButtonComponent,
    CategoriesComponent,
    SearchBarComponent,
    ShoppingCartComponent,
    HeaderDarkModeComponent,
    AccountComponent,
  ],
  host: {
    class:
      'sticky inset-0 z-10 block min-h-14 border-b border-border bg-background p-2',
  },
  template: `
    <nav>
      <div class="hidden justify-between md:flex">
        <div class="flex gap-2">
          <app-home-button />
          <app-categories />
        </div>
        <app-search-bar />
        <div class="flex gap-2">
          <app-shopping-cart />
          <app-dark-mode />
          <app-account />
        </div>
      </div>

      <div class="flex flex-col gap-2 md:hidden">
        <div class="flex justify-between">
          <div class="flex gap-2">
            <app-home-button />
            <app-categories />
          </div>
          <div class="flex gap-2">
            <app-shopping-cart />
            <app-dark-mode />
            <app-account />
          </div>
        </div>
        <app-search-bar />
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
