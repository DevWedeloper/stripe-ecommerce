import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  imports: [NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: StarRatingComponent,
      multi: true,
    },
  ],
  template: `
    <ul class="flex cursor-pointer text-3xl text-gray-500">
      @for (star of stars(); track i; let i = $index) {
        <li
          (click)="rate(i + 1)"
          (mouseenter)="hoverRating(i + 1)"
          (mouseleave)="clearHover()"
          class="w-8 text-center"
          [ngClass]="{ 'text-yellow-500': (hoverValue() || rating()) > i }"
        >
          ★
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRatingComponent implements ControlValueAccessor {
  protected stars = signal<number[]>([1, 2, 3, 4, 5]);
  protected rating = signal(0);
  protected hoverValue = signal(0);

  onChange: (rating: number) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: number): void {
    this.rating.set(value);
  }

  registerOnChange(fn: (rating: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected rate(value: number): void {
    this.rating.set(value);
    this.onChange(this.rating());
    this.onTouched();
  }

  protected hoverRating(value: number): void {
    this.hoverValue.set(value);
  }

  protected clearHover(): void {
    this.hoverValue.set(0);
  }
}
