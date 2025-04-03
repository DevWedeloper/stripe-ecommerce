import { RouteMeta } from '@analogjs/router';
import { Component } from '@angular/core';
import { metaWith } from 'src/app/shared/utils/meta';
import { DeleteUserComponent } from './feature/delete-user.component';
import { UpdateAvatarComponent } from './feature/update-avatar.component';
import { UpdateEmailComponent } from './feature/update-email.component';
import { UpdatePasswordComponent } from './feature/update-password.component';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce - Profile',
    'Update your profile information.',
  ),
  title: 'Stripe Ecommerce | Profile',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    UpdateAvatarComponent,
    UpdateEmailComponent,
    UpdatePasswordComponent,
    DeleteUserComponent,
  ],
  template: `
    <div class="flex flex-col gap-4">
      <app-update-avatar />
      <app-update-email />
      <app-update-password />
      <app-delete-user />
    </div>
  `,
})
export default class ProfilePageComponent {}
