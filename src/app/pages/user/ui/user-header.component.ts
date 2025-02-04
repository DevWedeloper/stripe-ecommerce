import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [HlmButtonDirective, NgIcon, HlmIconDirective, RouterLink],
  providers: [provideIcons({ lucideChevronLeft })],
  template: `
    <a hlmBtn size="icon" variant="ghost" routerLink="/user">
      <ng-icon hlm size="lg" name="lucideChevronLeft" />
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserHeaderComponent {}
