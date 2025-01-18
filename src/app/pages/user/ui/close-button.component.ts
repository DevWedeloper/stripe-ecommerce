import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-close-button',
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent, RouterLink],
  providers: [provideIcons({ lucideX })],
  host: {
    class: 'absolute right-4 top-4 z-10',
  },
  template: `
    <a hlmBtn size="icon" variant="ghost" routerLink="/">
      <hlm-icon size="lg" name="lucideX" />
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonComponent {}
