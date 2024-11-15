import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, HlmButtonDirective],
  host: {
    class:
      'flex min-h-screen flex-col items-center justify-center p-6 text-center',
  },
  template: `
    <img
      src="/not-found.svg"
      alt="404 Not Found"
      class="mb-6 w-full max-w-xs"
    />
    <h1 class="mb-4 text-4xl font-bold">Oops! Page Not Found</h1>
    <p class="mb-6 text-lg">
      The page you are looking for doesn't exist or has been moved.
    </p>
    <a hlmBtn routerLink="/" aria-label="Go back to the homepage">
      Go back to Home
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotFoundPageComponent {}
