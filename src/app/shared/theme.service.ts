import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  RendererFactory2,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReplaySubject, combineLatest } from 'rxjs';

const DarkModes = ['light', 'dark', 'system'] as const;
export type DarkMode = (typeof DarkModes)[number];

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _platformId = inject(PLATFORM_ID);
  private _renderer = inject(RendererFactory2).createRenderer(null, null);
  private _document = inject(DOCUMENT);
  private _query = inject(MediaMatcher).matchMedia(
    '(prefers-color-scheme: dark)',
  );
  private _darkMode$ = new ReplaySubject<'light' | 'dark' | 'system'>(1);
  private _systemDarkMode$ = new ReplaySubject<'light' | 'dark' | 'system'>(1);
  darkMode$ = this._darkMode$.asObservable();

  constructor() {
    this._systemDarkMode$.next(this._query.matches ? 'dark' : 'light');
    this._query.onchange = (e: MediaQueryListEvent) =>
      this._systemDarkMode$.next(e.matches ? 'dark' : 'light');
    this.syncInitialStateFromLocalStorage();
    this.toggleClassOnDarkModeChanges();
  }

  private syncInitialStateFromLocalStorage(): void {
    if (isPlatformBrowser(this._platformId)) {
      this._darkMode$.next(
        (localStorage.getItem('darkMode') as DarkMode) ?? 'system',
      );
    }
  }

  private toggleClassOnDarkModeChanges(): void {
    combineLatest([this.darkMode$, this._systemDarkMode$])
      .pipe(takeUntilDestroyed())
      .subscribe(([darkMode, systemDarkMode]) => {
        if (
          darkMode === 'dark' ||
          (darkMode === 'system' && systemDarkMode === 'dark')
        ) {
          this._renderer.addClass(this._document.documentElement, 'dark');
        } else {
          if (this._document.documentElement.className.includes('dark')) {
            this._renderer.removeClass(this._document.documentElement, 'dark');
          }
        }
      });
  }

  setDarkMode(newMode: DarkMode): void {
    localStorage.setItem('darkMode', newMode);
    this._darkMode$.next(newMode);
  }
}
