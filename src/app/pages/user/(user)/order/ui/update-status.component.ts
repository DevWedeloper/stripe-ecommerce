import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { BrnHoverCardImports } from '@spartan-ng/brain/hover-card';
import { HlmHoverCardModule } from '@spartan-ng/ui-hovercard-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-update-status',
  imports: [
    ...BrnHoverCardImports,
    HlmHoverCardModule,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
  ],
  providers: [provideIcons({ lucideInfo })],
  template: `
    <brn-hover-card>
      <button hlmBtn size="icon" brnHoverCardTrigger>
        <ng-icon hlm hlm size="sm" name="lucideInfo" />
      </button>
      <hlm-hover-card-content *brnHoverCardContent class="w-80">
        <div class="flex flex-col items-center gap-4">
          <p class="text-sm text-muted-foreground">
            Since this is just a project, updating the status will be simulated.
          </p>
          <button hlmBtn (click)="updateEmit.emit()" class="w-fit">
            Proceed to next step
          </button>
        </div>
      </hlm-hover-card-content>
    </brn-hover-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateStatusComponent {
  updateEmit = output<void>();
}
