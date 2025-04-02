import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideTrash2, lucideX } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { ImageItem } from '../types/image';

@Component({
  selector: 'app-preview-images',
  imports: [CdkDropList, CdkDrag, HlmButtonDirective, NgIcon, HlmIconDirective],
  providers: [provideIcons({ lucideCheck, lucideTrash2, lucideX })],
  host: {
    class: 'block',
  },
  template: `
    <h3 class="mb-2 text-lg font-semibold">Select a thumbnail:</h3>
    <p class="mb-4 text-sm text-muted-foreground">
      Click on an image to set it as the thumbnail.
    </p>
    <div
      cdkDropList
      cdkDropListOrientation="mixed"
      (cdkDropListDropped)="
        sorted.emit({
          previousIndex: $event.previousIndex,
          currentIndex: $event.currentIndex,
        })
      "
      class="boundary grid grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] place-items-center gap-4"
    >
      @for (item of imageItems(); track $index) {
        <div
          cdkDrag
          cdkDragBoundary=".boundary"
          class="list flex flex-col items-center gap-2"
        >
          <div class="relative w-fit cursor-pointer">
            <img
              [src]="item.url"
              alt="Preview"
              class="h-24 w-24 rounded-lg object-cover"
            />
            @if (selectedThumbnailId() === item.id) {
              <div
                class="pointer-events-none absolute inset-0 rounded-lg border-4 border-dashed border-border"
              ></div>
            }
            @if (markedForDeletion(item)) {
              <ng-icon
                hlm
                name="lucideX"
                class="absolute right-2 top-2 rounded-full bg-destructive"
              />
            }
          </div>
          <div class="flex gap-2">
            <button
              hlmBtn
              type="button"
              size="icon"
              (click)="selectedImageChange.emit(item.id)"
              class="h-6 w-6"
            >
              <ng-icon hlm size="xs" name="lucideCheck" />
            </button>
            <button
              hlmBtn
              type="button"
              size="icon"
              variant="destructive"
              (click)="removeImageItem.emit(item.id)"
              class="h-6 w-6"
            >
              <ng-icon hlm size="xs" name="lucideTrash2" />
            </button>
          </div>
        </div>
      }
    </div>
    <p class="mt-2 text-sm text-muted-foreground">
      If no image is selected, the first image will be used as the default
      thumbnail.
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewImagesComponent {
  imageItems = input.required<ImageItem[]>();
  selectedThumbnailId = input.required<string | number | null>();
  selectedImageChange = output<string | number>();
  removeImageItem = output<string | number>();
  sorted = output<{
    previousIndex: number;
    currentIndex: number;
  }>();

  protected markedForDeletion = (item: ImageItem): boolean => {
    return item.type === 'existing' && item.markedForDeletion;
  };
}
