import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { provideIcons } from '@ng-icons/core';
import { lucideMoon } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/ui-menu-brain';
import {
  HlmMenuComponent,
  HlmMenuItemCheckComponent,
  HlmMenuItemCheckboxDirective,
} from '@spartan-ng/ui-menu-helm';
import { DarkMode, ThemeService } from '../theme.service';

@Component({
  selector: 'app-dark-mode',
  standalone: true,
  imports: [
    BrnMenuTriggerDirective,
    HlmMenuComponent,
    HlmMenuItemCheckComponent,
    HlmMenuItemCheckboxDirective,
    HlmButtonDirective,
    HlmIconComponent,
  ],
  providers: [provideIcons({ lucideMoon })],
  template: `
    <button
      size="sm"
      variant="ghost"
      align="end"
      [brnMenuTriggerFor]="themeTpl"
      hlmBtn
    >
      <hlm-icon name="lucideMoon" size="sm" />
      <span class="sr-only">Open menu to change theme</span>
    </button>
    <ng-template #themeTpl>
      <hlm-menu class="w-40">
        <button
          hlmMenuItemCheckbox
          [checked]="theme() === 'light'"
          (click)="setTheme('light')"
        >
          <hlm-menu-item-check />
          Light
        </button>
        <button
          hlmMenuItemCheckbox
          [checked]="theme() === 'dark'"
          (click)="setTheme('dark')"
        >
          <hlm-menu-item-check />
          Dark
        </button>
        <button
          hlmMenuItemCheckbox
          [checked]="theme() === 'system'"
          (click)="setTheme('system')"
        >
          <hlm-menu-item-check />
          System
        </button>
      </hlm-menu>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderDarkModeComponent {
  private _themeService = inject(ThemeService);
  protected theme = toSignal(this._themeService.darkMode$);
  protected setTheme(theme: DarkMode) {
    this._themeService.setDarkMode(theme);
  }
}
