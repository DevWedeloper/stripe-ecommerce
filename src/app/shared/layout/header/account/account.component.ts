import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleUser,
  lucideLogIn,
  lucideLogOut,
  lucideSettings,
  lucideUserCheck,
} from '@ng-icons/lucide';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import {
  HlmMenuComponent,
  HlmMenuItemDirective,
  HlmMenuItemIconDirective,
  HlmMenuSeparatorComponent,
} from '@spartan-ng/ui-menu-helm';
import { AuthService } from '../../../data-access/auth.service';
import { SignOutService } from './sign-out.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    RouterLink,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
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
      <ng-icon hlm size="sm" name="lucideCircleUser" />
      <span class="sr-only">Open account menu</span>
    </button>
    <ng-template #accountTpl>
      <hlm-menu class="w-40">
        @if (user()) {
          <a hlmMenuItem routerLink="/user">
            <ng-icon hlm name="lucideSettings" hlmMenuIcon />
            <span>Settings</span>
          </a>

          <hlm-menu-separator />

          <button hlmMenuItem (click)="signOut()">
            <ng-icon hlm name="lucideLogOut" hlmMenuIcon />
            <span>Logout</span>
          </button>
        } @else {
          <a hlmMenuItem routerLink="/login">
            <ng-icon hlm name="lucideLogIn" hlmMenuIcon />
            <span>Login</span>
          </a>

          <hlm-menu-separator />

          <a hlmMenuItem routerLink="/sign-up">
            <ng-icon hlm name="lucideUserCheck" hlmMenuIcon />
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
