import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    FormsModule,
    HlmInputDirective,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
  ],
  providers: [provideIcons({ lucideSearch })],
  template: `
    <form
      #searchForm="ngForm"
      class="flex items-center gap-2"
      (ngSubmit)="onSubmit(searchForm)"
    >
      <input
        aria-label="Search bar"
        class="w-full md:w-80"
        hlmInput
        size="sm"
        type="text"
        placeholder="Search..."
        [(ngModel)]="keyword"
        name="keyword"
      />
      <button hlmBtn size="sm" variant="outline">
        <ng-icon hlm size="sm" name="lucideSearch" />
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  private router = inject(Router);

  protected keyword = signal<string>('');

  protected onSubmit(form: NgForm): void {
    if (!this.keyword().trim()) return;

    this.router.navigate(['/search'], {
      queryParams: { keyword: this.keyword().trim() },
    });
    form.resetForm();
  }
}
