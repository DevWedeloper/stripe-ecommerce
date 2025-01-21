import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideHouse, lucideUser } from '@ng-icons/lucide';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { SideNavHeadingLinkDirective } from './side-nav-heading-link.directive';
import { SideNavHeadingDirective } from './side-nav-heading.directive';
import { SideNavLinkDirective } from './side-nav-link.directive';
import { SideNavLinksComponent } from './side-nav-links.component';

@Component({
  selector: 'app-side-nav-content',
  standalone: true,
  imports: [
    HlmIconComponent,
    SideNavLinkDirective,
    SideNavHeadingLinkDirective,
    SideNavLinksComponent,
    SideNavHeadingDirective,
  ],
  providers: [provideIcons({ lucideUser, lucideHouse })],
  host: {
    class: 'block p-1',
  },
  template: `
    <div class="mb-4">
      <h4 appSideNavHeading>Account</h4>
      <app-side-nav-links>
        <a appSideNavLink="profile">
          <hlm-icon size="sm" class="mr-2" name="lucideUser" />
          Profile
        </a>
        <a appSideNavLink="address">
          <hlm-icon size="sm" class="mr-2" name="lucideHouse" />
          Address
        </a>
      </app-side-nav-links>
    </div>

    <div class="mb-4">
      <a appSideNavHeading appSideNavHeadingLink="order">Order</a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavContentComponent {}
