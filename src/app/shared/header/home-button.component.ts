import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'app-home-button',
  standalone: true,
  imports: [RouterLink, HlmButtonDirective],
  template: `
    <a size="sm" variant="ghost" hlmBtn routerLink="/">Home</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeButtonComponent {}
