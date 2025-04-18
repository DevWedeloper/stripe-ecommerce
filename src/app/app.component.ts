import { injectRequest } from '@analogjs/router/tokens';
import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterComponent } from '@spartan-ng/ui-sonner-helm';
import { TrpcHeaders } from 'src/trpc-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HlmToasterComponent],
  template: `
    <router-outlet />
    <hlm-toaster />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private request = injectRequest();

  constructor() {
    effect(() =>
      TrpcHeaders.update((headers) => ({
        ...headers,
        cookie: this.request?.headers.cookie,
      })),
    );
  }
}
