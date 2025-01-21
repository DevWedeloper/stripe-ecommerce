import { Directive } from '@angular/core';

@Directive({
  selector: '[appSideNavHeading]',
  host: {
    class:
      'mb-2 flex items-center justify-between rounded-md px-2 py-1 text-lg font-semibold',
  },
  standalone: true,
})
export class SideNavHeadingDirective {}
