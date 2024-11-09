import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmToasterComponent } from '@spartan-ng/ui-sonner-helm';

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
export class AppComponent {}
