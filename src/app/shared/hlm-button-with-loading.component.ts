import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideLoaderCircle } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'hlmBtnWithLoading',
  standalone: true,
  providers: [provideIcons({ lucideLoaderCircle })],
  imports: [HlmIconComponent],
  hostDirectives: [
    { directive: HlmButtonDirective, inputs: ['variant', 'size'] },
  ],
  template: `
    @if (isLoading()) {
      <hlm-icon size="sm" class="mr-2 animate-spin" name="lucideLoaderCircle" />
    }
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmButtonWithLoadingComponent {
  isLoading = input.required<boolean>();
}
