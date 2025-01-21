import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-side-nav-links',
  standalone: true,
  host: {
    class: 'grid gap-2',
  },
  template: '<ng-content/>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavLinksComponent {}
