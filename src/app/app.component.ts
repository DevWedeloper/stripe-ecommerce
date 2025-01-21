import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterComponent } from '@spartan-ng/ui-sonner-helm';
import { AppService } from './shared/data-access/app.service';

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
  private appService = inject(AppService);

  constructor() {
    this.appService.checkIfRedirectedFromMagicLink();
  }
}
