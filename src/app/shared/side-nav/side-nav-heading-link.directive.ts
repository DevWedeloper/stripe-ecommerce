import { Directive, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Directive({
  selector: '[appSideNavHeadingLink]',
  hostDirectives: [
    {
      directive: RouterLink,
      inputs: ['routerLink: appSideNavHeadingLink'],
    },
    RouterLinkActive,
  ],
  host: {
    class:
      'ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
  standalone: true,
})
export class SideNavHeadingLinkDirective {
  private routerLinkActive = inject(RouterLinkActive);

  constructor() {
    this.routerLinkActive.routerLinkActive = 'bg-accent text-accent-foreground';
  }
}
