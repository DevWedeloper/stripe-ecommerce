import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { hlmMuted } from '@spartan-ng/ui-typography-helm';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [HlmButtonDirective],
  host: {
    class: 'bg-blur-lg block border-t border-border bg-background/95 px-4 py-8',
  },
  template: `
    <footer class="${hlmMuted} mx-auto text-sm">
      Built by
      <a
        class="h-6 px-0.5 text-sm"
        hlmBtn
        href="https://github.com/DevWedeloper"
        target="_blank"
        variant="link"
      >
        DevWedeloper.
      </a>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
