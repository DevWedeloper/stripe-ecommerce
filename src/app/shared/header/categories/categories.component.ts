import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/ui-menu-brain';
import {
  HlmMenuComponent,
  HlmMenuItemDirective,
  HlmSubMenuComponent,
} from '@spartan-ng/ui-menu-helm';
import { HlmSpinnerComponent } from '@spartan-ng/ui-spinner-helm';
import { CategoriesService } from './categories.service';
import { redirectToCategory } from './category-utils';
import { SubcategoriesComponent } from './subcategories.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    RouterLink,
    BrnMenuTriggerDirective,
    HlmButtonDirective,
    HlmMenuComponent,
    HlmSubMenuComponent,
    HlmMenuItemDirective,
    HlmSpinnerComponent,
    SubcategoriesComponent,
  ],
  template: `
    <button
      size="sm"
      variant="ghost"
      [brnMenuTriggerFor]="categoriesTpl"
      hlmBtn
    >
      Categories
    </button>
    <ng-template #categoriesTpl>
      <hlm-menu class="w-40">
        @if (!initialLoading()) {
          @for (category of categories(); track $index) {
            @if (category.subcategories.length > 0) {
              <button hlmMenuItem [brnMenuTriggerFor]="subcategory">
                {{ category.name }}
              </button>
              <ng-template #subcategory>
                <hlm-sub-menu>
                  <app-subcategories
                    [categories]="category.subcategories"
                    [parentCategory]="category.name"
                  />
                </hlm-sub-menu>
              </ng-template>
            } @else {
              <a hlmMenuItem [routerLink]="redirectToCategory(category.name)">
                {{ category.name }}
              </a>
            }
          }
        } @else {
          <div class="flex items-center justify-center">
            <hlm-spinner />
          </div>
        }
        @if (hasError()) {
          <div>An error occurred...</div>
        }
      </hlm-menu>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  private categoriesService = inject(CategoriesService);
  protected categories = this.categoriesService.categories;
  protected initialLoading = this.categoriesService.initialLoading;
  protected hasError = this.categoriesService.hasError;

  protected redirectToCategory = redirectToCategory;
}
