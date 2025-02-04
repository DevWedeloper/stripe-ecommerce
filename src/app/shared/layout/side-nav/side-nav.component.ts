import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { hlm } from '@spartan-ng/brain/core';
import { HlmScrollAreaDirective } from '@spartan-ng/ui-scrollarea-helm';
import { ClassValue } from 'clsx';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SideNavContentComponent } from './side-nav-content.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [NgScrollbarModule, HlmScrollAreaDirective, SideNavContentComponent],
  host: {
    '[class]': 'computedClass()',
  },
  template: `
    <ng-scrollbar hlm visibility="hover" class="h-screen">
      <app-side-nav-content />
    </ng-scrollbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
  userClass = input<ClassValue>('', { alias: 'class' });

  protected computedClass = computed(() =>
    hlm(
      'sticky top-0 mx-auto h-screen w-full max-w-[760px] lg:w-[320px]',
      this.userClass(),
    ),
  );
}
