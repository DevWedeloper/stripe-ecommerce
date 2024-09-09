import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideMoveLeft } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-go-back-button',
  standalone: true,
  imports: [RouterLink, HlmButtonDirective, HlmIconComponent],
  providers: [provideIcons({ lucideMoveLeft })],
  template: `
    <a hlmBtn variant="ghost" size="lg" class="mb-2" [routerLink]="path()">
      <hlm-icon size="sm" class="mr-2" name="lucideMoveLeft" />
      {{ text() }}
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoBackButtonComponent {
  path = input.required<string>();
  text = input.required<string>();
}
