import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-close-button',
  standalone: true,
  imports: [HlmButtonDirective, NgIcon, HlmIconDirective, RouterLink],
  providers: [provideIcons({ lucideX })],
  host: {
    class: 'absolute right-4 top-4 z-10',
  },
  template: `
    <a hlmBtn size="icon" variant="ghost" routerLink="/">
      <ng-icon hlm size="lg" name="lucideX" />
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonComponent {}
