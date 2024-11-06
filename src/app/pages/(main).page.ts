import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  host: {
    class: 'block w-full',
  },
  template: `
    <app-header />
    <main class="min-h-[calc(100vh-9.5rem)] p-4 md:p-8">
      <router-outlet />
    </main>
    <app-footer />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainPageComponent {}
