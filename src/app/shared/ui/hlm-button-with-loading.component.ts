import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoaderCircle } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'button[hlmBtnWithLoading]',
  standalone: true,
  providers: [provideIcons({ lucideLoaderCircle })],
  imports: [NgIcon, HlmIconDirective],
  hostDirectives: [
    { directive: HlmButtonDirective, inputs: ['variant', 'size'] },
  ],
  template: `
    @if (isLoading()) {
      <ng-icon
        hlm
        size="sm"
        class="mr-2 animate-spin"
        name="lucideLoaderCircle"
      />
    }
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmButtonWithLoadingComponent {
  isLoading = input.required<boolean>();
}
