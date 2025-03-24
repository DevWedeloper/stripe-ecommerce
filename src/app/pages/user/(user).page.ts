import { RouteMeta } from '@analogjs/router';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isAuthenticatedGuard } from 'src/app/shared/guards/is-authenticated.guard';
import { SideNavComponent } from 'src/app/shared/layout/side-nav/side-nav.component';
import { CloseButtonComponent } from './ui/close-button.component';
import { UserHeaderComponent } from './ui/user-header.component';

export const routeMeta: RouteMeta = {
  canActivateChild: [isAuthenticatedGuard],
};

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SideNavComponent,
    CloseButtonComponent,
    UserHeaderComponent,
  ],
  host: {
    class: 'relative w-full flex justify-center',
  },
  template: `
    <app-close-button class="hidden lg:block" />

    <div class="flex w-full max-w-[1080px] flex-row gap-4">
      <app-side-nav class="hidden py-16 lg:block" />

      <main class="w-full py-0 lg:py-16">
        <app-user-header class="block lg:hidden" />
        <router-outlet />
      </main>
    </div>
  `,
})
export default class AccountLayoutComponent {}
