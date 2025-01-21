import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCircleUser,
  lucideLogIn,
  lucideLogOut,
  lucideSettings,
  lucideUserCheck,
} from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/ui-menu-brain';
import {
  HlmMenuComponent,
  HlmMenuItemDirective,
  HlmMenuItemIconDirective,
  HlmMenuSeparatorComponent,
} from '@spartan-ng/ui-menu-helm';
import { SignOutService } from './sign-out.service';
import { AuthService } from '../../../data-access/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    HlmIconComponent,
    BrnMenuTriggerDirective,
    HlmMenuComponent,
    HlmMenuItemDirective,
    HlmMenuItemIconDirective,
    HlmMenuSeparatorComponent,
  ],
  providers: [
    provideIcons({
      lucideCircleUser,
      lucideSettings,
      lucideLogIn,
      lucideUserCheck,
      lucideLogOut,
    }),
  ],
  template: `
    <button
      size="sm"
      variant="ghost"
      align="end"
      [brnMenuTriggerFor]="accountTpl"
      hlmBtn
    >
      <hlm-icon size="sm" name="lucideCircleUser" />
      <span class="sr-only">Open account menu</span>
    </button>
    <ng-template #accountTpl>
      <hlm-menu class="w-40">
        @if (user()) {
          <a hlmMenuItem routerLink="/user">
            <hlm-icon name="lucideSettings" hlmMenuIcon />
            <span>Settings</span>
          </a>

          <hlm-menu-separator />

          <button hlmMenuItem (click)="signOut()">
            <hlm-icon name="lucideLogOut" hlmMenuIcon />
            <span>Logout</span>
          </button>
        } @else {
          <a hlmMenuItem routerLink="/login">
            <hlm-icon name="lucideLogIn" hlmMenuIcon />
            <span>Login</span>
          </a>

          <hlm-menu-separator />

          <a hlmMenuItem routerLink="/sign-up">
            <hlm-icon name="lucideUserCheck" hlmMenuIcon />
            <span>Sign-Up</span>
          </a>
        }
      </hlm-menu>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  private authService = inject(AuthService);
  private signOutService = inject(SignOutService);

  protected user = this.authService.user;

  protected signOut(): void {
    this.signOutService.signOut();
  }
}
