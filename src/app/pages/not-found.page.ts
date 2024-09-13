import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, HlmButtonDirective],
  template: `
    <p>Page not found</p>
    <a hlmBtn routerLink="/">Go back to Home</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotFoundPageComponent {}
