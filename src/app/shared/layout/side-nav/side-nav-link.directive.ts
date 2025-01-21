import { Directive, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Directive({
  selector: '[appSideNavLink]',
  hostDirectives: [
    {
      directive: RouterLink,
      inputs: ['routerLink: appSideNavLink'],
    },
    RouterLinkActive,
  ],
  host: {
    class:
      'inline-flex h-10 items-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },
  standalone: true,
})
export class SideNavLinkDirective {
  private routerLinkActive = inject(RouterLinkActive);

  constructor() {
    this.routerLinkActive.routerLinkActive = 'bg-accent text-accent-foreground';
  }
}
