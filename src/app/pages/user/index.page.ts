import { RouteMeta } from '@analogjs/router';
import { Component } from '@angular/core';
import { isAuthenticatedGuard } from 'src/app/shared/guards/is-authenticated.guard';
import { SideNavComponent } from 'src/app/shared/layout/side-nav/side-nav.component';
import { metaWith } from 'src/app/shared/utils/meta';
import { DeleteUserComponent } from './(user)/profile/feature/delete-user.component';
import { UpdateAvatarComponent } from './(user)/profile/feature/update-avatar.component';
import { UpdateEmailComponent } from './(user)/profile/feature/update-email.component';
import { UpdatePasswordComponent } from './(user)/profile/feature/update-password.component';
import { CloseButtonComponent } from './ui/close-button.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Account',
    'Manage your account details and preferences.',
  ),
  title: 'Stripe Ecommerce | Account',
  canActivate: [isAuthenticatedGuard],
};

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    SideNavComponent,
    CloseButtonComponent,
    UpdateAvatarComponent,
    UpdateEmailComponent,
    UpdatePasswordComponent,
    DeleteUserComponent,
  ],
  host: {
    class: 'relative w-full flex justify-center',
  },
  template: `
    <app-close-button />

    <div class="flex w-full max-w-[1080px] flex-row gap-4">
      <app-side-nav class="py-16" />

      <main class="hidden w-full py-16 lg:block">
        <div class="flex flex-col gap-4">
          <app-update-avatar />
          <app-update-email />
          <app-update-password />
          <app-delete-user />
        </div>
      </main>
    </div>
  `,
})
export default class AccountPageComponent {}
