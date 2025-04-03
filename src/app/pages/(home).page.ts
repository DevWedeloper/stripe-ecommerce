import { RouteMeta } from '@analogjs/router';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideList, lucideSearch } from '@ng-icons/lucide';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { AppService } from '../shared/data-access/app.service';
import { FooterComponent } from '../shared/layout/footer/footer.component';
import { HeaderComponent } from '../shared/layout/header/header.component';
import { metaWith } from '../shared/utils/meta';

export const routeMeta: RouteMeta = {
  meta: metaWith(
    'Stripe Ecommerce',
    'A modern eCommerce platform powered by Stripe—buy and sell products with ease, enjoy a seamless checkout experience, and manage orders effortlessly.',
  ),
  title: 'Stripe Ecommerce',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIcon,
    HlmIconDirective,
    HlmCardDirective,
    HeaderComponent,
    FooterComponent,
  ],
  providers: [provideIcons({ lucideList, lucideSearch })],
  template: `
    <app-header />
    <main class="p-4 md:p-8">
      <section class="flex h-64 items-center justify-center">
        <div class="text-center">
          <h1 class="text-3xl font-bold">Welcome to My E-commerce Store!</h1>
          <p class="mt-2 text-lg">Get started with our quick guide below.</p>
        </div>
      </section>

      <section class="px-6 py-12 md:px-12 lg:px-24">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="text-2xl font-semibold">How to Get Around</h2>
          <p class="mt-2">
            Follow these simple steps to explore our store and find what
            you&#39;re looking for!
          </p>
        </div>

        <div class="mx-auto mt-10 flex max-w-4xl flex-col gap-8 md:flex-row">
          <div hlmCard class="flex flex-col items-center p-6">
            <ng-icon hlm size="xl" name="lucideList" class="mb-4" />
            <h3 class="text-lg font-medium">Explore Categories</h3>
            <p class="mt-2 text-center">
              Use our Categories dropdown in the top navigation bar to browse
              products by category.
            </p>
          </div>

          <div hlmCard class="flex flex-col items-center p-6">
            <ng-icon hlm size="xl" name="lucideSearch" class="mb-4" />
            <h3 class="text-lg font-medium">Search for Specific Products</h3>
            <p class="mt-2 text-center">
              Looking for something specific? Use the search bar at the top to
              find exactly what you need.
            </p>
          </div>
        </div>
      </section>
    </main>
    <app-footer />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent {
  private router = inject(Router);
  private appService = inject(AppService);

  constructor() {
    effect(() => {
      const clearUrl = this.appService.clearUrl();
      if (clearUrl) {
        this.router.navigate([], {
          queryParams: null,
          fragment: undefined,
        });
      }
    });
  }
}
