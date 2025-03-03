import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet],
  host: {
    class: 'flex h-screen items-center justify-center p-4',
  },
  template: `
    <main class="w-[400px]">
      <router-outlet />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthPageComponent {}
