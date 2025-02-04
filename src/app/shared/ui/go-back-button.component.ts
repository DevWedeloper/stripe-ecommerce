import { Location } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoveLeft } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-go-back-button',
  standalone: true,
  imports: [RouterLink, HlmButtonDirective, NgIcon, HlmIconDirective],
  providers: [provideIcons({ lucideMoveLeft })],
  template: `
    @if (navigateBack()) {
      <button hlmBtn variant="ghost" size="lg" class="mb-2" (click)="goBack()">
        <ng-icon hlm size="sm" class="mr-2" name="lucideMoveLeft" />
        {{ text() }}
      </button>
    } @else {
      <a hlmBtn variant="ghost" size="lg" class="mb-2" [routerLink]="path()">
        <ng-icon hlm size="sm" class="mr-2" name="lucideMoveLeft" />
        {{ text() }}
      </a>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoBackButtonComponent {
  private location = inject(Location);

  path = input<string>();
  text = input.required<string>();
  navigateBack = input(false, { transform: booleanAttribute });

  protected goBack(): void {
    this.location.back();
  }
}
