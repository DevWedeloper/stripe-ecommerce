import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import {
  HlmMenuItemDirective,
  HlmSubMenuComponent,
} from '@spartan-ng/ui-menu-helm';
import { CategoryWithSubcategories } from 'src/server/use-cases/category/get-category-tree';
import { redirectToCategory } from './category-utils';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [
    RouterLink,
    BrnMenuTriggerDirective,
    HlmSubMenuComponent,
    HlmMenuItemDirective,
  ],
  template: `
    @for (category of categories(); track $index) {
      @if (category.subcategories.length > 0) {
        <button hlmMenuItem [brnMenuTriggerFor]="subcategory">
          {{ category.name }}
        </button>
        <ng-template #subcategory>
          <hlm-sub-menu>
            <app-subcategories
              [categories]="category.subcategories"
              [parentCategory]="generateCategoryPath(category.name)"
            />
          </hlm-sub-menu>
        </ng-template>
      } @else {
        <a
          hlmMenuItem
          [routerLink]="redirectToCategory(generateCategoryPath(category.name))"
        >
          {{ category.name }}
        </a>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubcategoriesComponent {
  categories = input.required<CategoryWithSubcategories[]>();
  parentCategory = input.required<string>();

  protected redirectToCategory = redirectToCategory;

  protected generateCategoryPath(categoryName: string): string {
    return `${this.parentCategory()}/${categoryName}`;
  }
}
